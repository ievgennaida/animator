import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { ViewService } from "src/app/services/view.service";
import { ViewMode } from "src/app/models/view-mode";
import { consts } from "src/environments/consts";
import { Utils } from "src/app/services/utils/utils";
import { StorageService } from "src/app/services/storage.service";
import { takeUntil } from "rxjs/operators";

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
    private storage: StorageService
  ) {
    super();
    this.cdRef.detach();
  }
  // resize:
  initialDragSize = 0
  dragStartedArgs: MouseEvent = null;
  resizeMenuPanel = false;
  resizeCursorPrecision = 6;
  // accordion:
  propExpanded = this.storage.propExpanded;
  outlineExpanded = this.storage.outlineExpanded;
  mode: ViewMode = consts.appearance.defaultMode;
  ViewMode = ViewMode;

  outlinePanelEl: ElementRef<HTMLElement>;
  @ViewChild("outlinePanel", { read: ElementRef })
  set getOutlinePanelEl(value: ElementRef<HTMLElement>) {
    this.outlinePanelEl = value;
    this.stateChanged();
  }

  @ViewChild("propertiesPanel", { read: ElementRef })
  propertiesPanelEl: ElementRef<HTMLElement>;
  toggleProp() {
    this.propExpanded = !this.propExpanded;
    this.stateChanged();
    this.cdRef.detectChanges();
  }
  toggleOutline() {
    this.outlineExpanded = !this.outlineExpanded;
    this.stateChanged();
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    const defaultSize =
      this.storage.menuPanelSize || consts.appearance.menuPanelSize;
    this.storage.menuPanelSize = this.setPanelSize(defaultSize);
    this.propExpanded = this.storage.propExpanded;
    this.outlineExpanded = this.storage.outlineExpanded;
    this.viewService.emitViewportResized();
    this.viewService.viewModeSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((mode) => {
        if (this.mode !== mode) {
          this.mode = mode;
          this.stateChanged();
          if (this.mode === ViewMode.Animator) {
            this.storage.propExpanded = this.propExpanded = true;
          }
          this.cdRef.detectChanges();
        }
      });

    this.viewService.resized.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.storage.menuPanelSize = this.setPanelSize();
      this.cdRef.detectChanges();
    });
    this.cdRef.detectChanges();
  }
  resize(size: number, maxSize: number): number {
    const min = maxSize * 0.2;
    const max = maxSize * 0.8;
    if (size <= min) {
      size = min;
    }

    if (size >= max) {
      size = max;
    }

    return size;
  }

  stateChanged() {
    this.storage.outlineExpanded = this.outlineExpanded;
    this.storage.propExpanded = this.propExpanded;
    const outlineVisible =
      this.outlineExpanded && this.mode !== ViewMode.Animator;
    if (this.propExpanded && outlineVisible) {
      this.onRescale(this.storage.resizedOutline);
      return;
    }

    if (this.outlinePanelEl) {
      const el1 = this.outlinePanelEl.nativeElement;
      el1.style.height = this.outlineExpanded ? "100%" : "auto";
    }
    if (this.propertiesPanelEl) {
      const el2 = this.propertiesPanelEl.nativeElement;
      el2.style.height = this.propExpanded ? "100%" : "auto";
    }
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
          this.onRescale(this.initialDragSize);
        }
      }
    } else if (this.dragStartedArgs && this.initialDragSize) {
      if (this.resizeMenuPanel) {
        const size =
          this.initialDragSize + this.dragStartedArgs.clientX - event.clientX;
        this.storage.menuPanelSize = this.setPanelSize(size);
        this.viewService.emitViewportResized();
      } else {
        this.onRescale(
          this.initialDragSize + this.dragStartedArgs.clientY - event.clientY
        );
      }
    }
  }
  dragStarted(event: MouseEvent, panel: boolean = false) {
    event.preventDefault();
    this.resizeMenuPanel = panel;
    this.dragStartedArgs = event;
    if (panel) {
      if (this.hostElementRef && this.hostElementRef.nativeElement) {
        this.initialDragSize = this.hostElementRef.nativeElement.offsetWidth;
      }
    } else {
      if (this.outlinePanelEl && this.outlinePanelEl.nativeElement) {
        this.initialDragSize = this.outlinePanelEl.nativeElement.clientHeight;
      }
    }
  }

  /**
   * Drag menu bounds, resize panel.
   */
  dragFinished(event: MouseEvent) {
    if (this.dragStartedArgs) {
      this.dragStartedArgs = null;
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      this.viewService.emitViewportResized();
    }
  }
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
  onRescale(desiredHeight) {
    if (!this.outlinePanelEl || !this.propertiesPanelEl) {
      return;
    }

    const el1 = this.outlinePanelEl.nativeElement;
    const el2 = this.propertiesPanelEl.nativeElement;
    const h = el1.parentElement.clientHeight - this.resizeCursorPrecision;
    if (!desiredHeight) {
      // set default value:
      desiredHeight = h / 2;
    }
    const percents = (desiredHeight / h) * 100;

    const height = this.resize(percents, 100);
    el1.style.height = height + "%";
    el2.style.height = 100 - height + "%";
    this.storage.resizedOutline = el1.clientHeight;
  }
}
