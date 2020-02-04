import { Injectable } from "@angular/core";
import { BaseTool } from "./base.tool";
import { MouseEventArgs } from "./MouseEventArgs";
import { ViewportService } from "./viewport.service";
import { LoggerService } from "../logger.service";
import { ScrollbarsPanTool } from "./scrollbars-pan.tool";
import { PanTool } from "./pan.tool";
import { consts } from "src/environments/consts";

@Injectable({
  providedIn: "root"
})
export class SelectionTool extends BaseTool {
  constructor(
    private viewportService: ViewportService,
    private logger: LoggerService,
    private scrollbarsPanTool: ScrollbarsPanTool,
    private panTool: PanTool
  ) {
    super();
  }
  iconName = "navigation";
  selectionRectElement: HTMLElement;

  private containerRect: DOMRect = null;
  private selectionRect: DOMRect = null;
  private startPos: DOMPoint = null;
  private currentArgs: MouseEventArgs = null;

  private autoPanIntervalRef = null;
  init(element: HTMLElement) {
    this.selectionRectElement = element;
  }

  onViewportMouseDown(e: MouseEventArgs) {
    this.startPos = this.trackMousePos(e);
    this.containerRect = this.viewportService.getContainerClientRect();
  }

  onWindowBlur() {
    this.cleanUp();
  }

  onWindowMouseUp(e: MouseEventArgs) {
    this.currentArgs = e;
    this.trackMousePos(e);
    this.cleanUp();
  }

  onWindowMouseMove(event: MouseEventArgs) {
    if (!this.startPos) {
      return;
    }

    this.currentArgs = event;
    this.trackMousePos(event);
    this.updateSelectorUi();
    this.startAutoPan();
  }

  cleanUp() {
    this.selectionRect = null;
    this.startPos = null;
    this.currentArgs = null;
    this.containerRect = null;
    this.stopAutoPan();
    this.updateSelectorUi();
  }

  autoPan(mousePosition: DOMPoint, containerSize: DOMRect) {
    if (!mousePosition) {
      return;
    }

    const pan = this.viewportService.getPan();
    let done = false;
    // TODO: determine autopan automatically.
    const panByMouseSpeed = consts.autoPanSpeed * this.viewportService.getZoom();
    if (mousePosition.x < 0) {
      pan.x += panByMouseSpeed;
      done = true;
    } else if (mousePosition.x > containerSize.width) {
      pan.x -= panByMouseSpeed;
      done = true;
    }

    if (mousePosition.y < 0) {
      pan.y += panByMouseSpeed;
      done = true;
    } else if (mousePosition.y > containerSize.height) {
      pan.y -= panByMouseSpeed;
      done = true;
    }

    if (done) {
      this.panTool.pan(pan.x, pan.y);
    }

    return done;
  }
  stopAutoPan() {
    if (this.autoPanIntervalRef) {
      clearInterval(this.autoPanIntervalRef);
      this.autoPanIntervalRef = null;
    }
  }

  startAutoPan() {
    const performed = this.autoPan(
      new DOMPoint(this.currentArgs.clientX, this.currentArgs.clientY),
      this.containerRect
    );
    if (performed) {
      if (!this.autoPanIntervalRef) {
        // Repeat move calls to
        this.autoPanIntervalRef = setInterval(() => {
          this.autoPan(
            new DOMPoint(this.currentArgs.clientX, this.currentArgs.clientY),
            this.containerRect
          );
        }, 50);
      }
    }
  }

  updateSelectorUi() {
    if (!this.selectionRect) {
      this.selectionRectElement.setAttribute("display", "none");
      return;
    }
    // TODO: run outside angular
    const matrix = this.viewportService.viewport.ownerSVGElement
      .createSVGMatrix()
      .inverse()
      .translate(this.selectionRect.x, this.selectionRect.y);
    this.viewportService.setCTMForElement(this.selectionRectElement, matrix);
    this.selectionRectElement.setAttribute("display", "initial");
    this.selectionRectElement.setAttribute(
      "width",
      this.selectionRect.width.toString()
    );
    this.selectionRectElement.setAttribute(
      "height",
      this.selectionRect.height.toString()
    );
  }

  getMousePos(event: MouseEventArgs) {
    // TODO: cache this.
    const point = this.viewportService.toSvgPoint(
      event.clientX,
      event.clientY,
      false
    );
    point.x -= this.containerRect.left;
    point.y -= this.containerRect.top;
    return point;
  }

  trackMousePos(event: MouseEventArgs) {
    if (!this.containerRect) {
      this.containerRect = this.viewportService.getContainerClientRect();
    }

    const pos = this.getMousePos(event);
    if (this.startPos) {
      if (!this.selectionRect) {
        this.selectionRect = new DOMRect();
      }

      // get the pos with the virtualization:
      this.selectionRect.x = Math.min(this.startPos.x, pos.x);
      this.selectionRect.y = Math.min(this.startPos.y, pos.y);
      this.selectionRect.width =
        Math.max(this.startPos.x, pos.x) - this.selectionRect.x;
      this.selectionRect.height =
        Math.max(this.startPos.y, pos.y) - this.selectionRect.y;
    }

    return pos;
  }
}
