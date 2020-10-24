import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { ViewMode } from "src/app/models/view-mode";
import { ConfigService } from "src/app/services/config-service";
import { MenuPanel, MenuService } from "src/app/services/menu-service";
import { Utils } from "src/app/services/utils/utils";
import { ViewService } from "src/app/services/view.service";
import { BaseComponent } from "../base-component";

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent extends BaseComponent implements OnInit, OnDestroy {
  constructor(
    private viewService: ViewService,
    private cdRef: ChangeDetectorRef,
    private hostElementRef: ElementRef,
    private menuService: MenuService,
    private config: ConfigService
  ) {
    super();
    this.cdRef.detach();
  }

  panelsRef: QueryList<ElementRef>;

  @ViewChildren("panelElement")
  set getOutlinePanelEl(value: QueryList<ElementRef>) {
    this.panelsRef = value;
  }

  // resize:
  initialDragSize = 0;
  initialDragProportion = 0;
  dragStartedArgs: MouseEvent = null;
  panelIndex: number | null = null;
  lastExpandedIndex: number | null = null;
  panels: MenuPanel[] = [];
  resizeMenuPanel = false;
  resizeCursorPrecision = 6;
  mode: ViewMode = ViewMode.Editor;
  toggleMenu(item: MenuPanel) {
    item.expanded = !item.expanded;
    this.checkExpandedState();
    this.cdRef.detectChanges();
  }
  checkExpandedState() {
    if (!this.panels) {
      this.lastExpandedIndex = null;
    } else {
      this.panels.forEach((p, index) => {
        if (p.expanded) {
          this.lastExpandedIndex = index;
        }
      });
    }
  }
  ngOnInit(): void {
    this.panels = this.menuService.getVisibleMenu();
    const defaultSize =
      this.config.menuPanelSize || this.config.get().appearance.menuPanelSize;
    this.config.menuPanelSize = this.setPanelSize(defaultSize);

    this.viewService.emitViewportResized();

    this.menuService.menuChanged
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.panels = this.menuService.getVisibleMenu();
        this.checkExpandedState();
        this.cdRef.detectChanges();
      });

    this.viewService.resized.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.config.menuPanelSize = this.setPanelSize();
      this.cdRef.detectChanges();
    });
    this.cdRef.detectChanges();
  }

  dragMove(event: MouseEvent) {
    if (!this.dragStartedArgs) {
      return;
    }

    event.preventDefault();
    if (
      this.dragStartedArgs &&
      event.buttons !== undefined &&
      event.buttons !== 1
    ) {
      // cancel drag:
      this.dragStartedArgs = null;
      if (this.resizeMenuPanel) {
        this.hostElementRef.nativeElement.style.width =
          this.initialDragSize + "px";
        this.viewService.emitViewportResized();
      } else {
        if (this.initialDragSize) {
          this.recalculatePanelsSize(this.initialDragSize);
        }
      }
    } else if (this.dragStartedArgs && this.initialDragSize) {
      if (this.resizeMenuPanel) {
        const size =
          this.initialDragSize + this.dragStartedArgs.clientX - event.clientX;
        this.config.menuPanelSize = this.setPanelSize(size);
        this.viewService.emitViewportResized();
      } else {
        const newSize =
          this.initialDragSize +
          (-this.dragStartedArgs.clientY + event.clientY);
        this.recalculatePanelsSize(newSize);
      }
    }
  }
  dragStartedNode(event: MouseEvent, index: any) {
    event.preventDefault();
    if (!this.panelsRef) {
      return;
    }
    const element = this.getPanelElement(index);
    if (element) {
      this.resizeMenuPanel = false;
      this.dragStartedArgs = event;
      this.panelIndex = index;
      this.initialDragSize = element.clientHeight;
      this.initialDragProportion = this.panels[index]?.height || 100;
    }
  }

  dragStartedPanel(event: MouseEvent) {
    event.preventDefault();
    this.resizeMenuPanel = true;
    this.dragStartedArgs = event;
    if (this.hostElementRef && this.hostElementRef.nativeElement) {
      this.initialDragSize = this.hostElementRef.nativeElement.offsetWidth;
    }
  }

  /**
   * Drag menu bounds, resize panel.
   */
  dragFinished(event: MouseEvent) {
    if (this.dragStartedArgs) {
      this.panelIndex = null;
      this.dragStartedArgs = null;
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      this.viewService.emitViewportResized();
    }
  }
  /**
   * Set the right panel proportional size.
   * @param size new panel size.
   */
  setPanelSize(size: number = 0): number {
    if (!this.hostElementRef || !this.hostElementRef.nativeElement) {
      return;
    }
    const el = this.hostElementRef.nativeElement;

    if (!size) {
      size = el.offsetWidth;
    }
    const validatedNumber = Utils.keepInBounds(
      size,
      el.parentElement.offsetWidth
    );
    const num = validatedNumber + "px";
    if (el.style.width !== num) {
      el.style.width = num;
    }
    return validatedNumber;
  }
  getPanelElement(index: number): HTMLElement | null {
    const ref = this.panelsRef.toArray()[index];
    if (ref) {
      return ref.nativeElement;
    }
    return null;
  }

  recalculatePanelsSize(desiredHeight: number | null = null) {
    if (!this.panelsRef) {
      return;
    }

    // Get parent height:
    const maxHeight = this.getPanelElement(this.panelIndex || 0)?.parentElement
      ?.clientHeight;
    if (!maxHeight) {
      return;
    }

    const el = this.getPanelElement(this.panelIndex);
    const panel1 = this.panels[this.panelIndex];
    if (!el || !panel1) {
      console.log("Cannot resize panel");
    }

    const percents = panel1.height;
    const maxElHeight = el.clientHeight;

    panel1.height = desiredHeight * (percents / maxElHeight);
    this.cdRef.detectChanges();
    this.menuService.saveMenuSettings();
  }
}
