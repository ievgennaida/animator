import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { ViewService } from "src/app/services/view.service";
import { ViewMode } from "src/environments/view-mode";
import { consts } from "src/environments/consts";
import { ResizeEvent } from "angular-resizable-element";
import { MatExpansionPanel } from "@angular/material/expansion";

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnInit {
  constructor(
    private viewService: ViewService,
    private cdRef: ChangeDetectorRef
  ) {}
  dragStartedArgs: MouseEvent = null;
  initialDragSize = 0;
  resizeCursorPrecision = 6;
  propertiesPanel: MatExpansionPanel = null;
  // TODO: save prefereneces
  propExpanded = true;
  outlineExpanded = true;
  mode: ViewMode = consts.appearance.defaultMode;
  ViewMode = ViewMode;
  lastOutlineHeight = 0;

  @ViewChild("propertiesPanel")
  set getPropertiesPanel(value: MatExpansionPanel) {
    this.propertiesPanel = value;
    this.stateChanged();
  }

  outlinePanel: MatExpansionPanel = null;
  @ViewChild("outlinePanel")
  set getOutlinePanel(value: MatExpansionPanel) {
    this.outlinePanel = value;
    this.stateChanged();
  }

  outlinePanelEl: ElementRef<HTMLElement>;
  @ViewChild("outlinePanel", { read: ElementRef })
  set getOutlinePanelEl(value: ElementRef<HTMLElement>) {
    this.outlinePanelEl = value;
    this.stateChanged();
  }

  @ViewChild("propertiesPanel", { read: ElementRef })
  propertiesPanelEl: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.viewService.viewModeSubject.asObservable().subscribe((mode) => {
      if (this.mode !== mode) {
        this.mode = mode;
        this.stateChanged();
        if (this.mode === ViewMode.Animator) {
          this.propExpanded = true;
        }
        this.cdRef.markForCheck();
      }
    });
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
    if (!this.propertiesPanel) {
      return;
    }

    if (this.outlinePanel && this.outlinePanel) {
      this.outlineExpanded = this.outlinePanel.expanded;
    }

    this.propExpanded = this.propertiesPanel.expanded;

    const outlineVisible =
      this.outlinePanel &&
      this.outlineExpanded &&
      this.mode !== ViewMode.Animator;
    if (this.propExpanded && outlineVisible) {
      this.onRescale(this.lastOutlineHeight);
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
      if (this.initialDragSize) {
        this.onRescale(this.initialDragSize);
      }
    } else if (this.dragStartedArgs && this.initialDragSize) {
      this.onRescale(
        this.initialDragSize + this.dragStartedArgs.clientY - event.clientY
      );
    }
  }
  dragStarted(event: MouseEvent) {
    this.dragStartedArgs = event;
    if (this.outlinePanelEl && this.outlinePanelEl.nativeElement) {
      this.initialDragSize = this.outlinePanelEl.nativeElement.clientHeight;
    }
  }
  dragFinished(event: MouseEvent) {
    if (this.dragStartedArgs) {
      event.preventDefault();
    }
    this.dragStartedArgs = null;
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
    this.lastOutlineHeight = el1.clientHeight;
  }
}
