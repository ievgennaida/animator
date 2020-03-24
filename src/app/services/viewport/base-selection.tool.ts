import { Injectable } from "@angular/core";
import { BaseTool } from "./base.tool";
import { MouseEventArgs } from "./mouse-event-args";
import { ViewportService } from "./viewport.service";
import { LoggerService } from "../logger.service";
import { PanTool } from "./pan.tool";
import { consts } from "src/environments/consts";

@Injectable({
  providedIn: "root"
})
export class BaseSelectionTool extends BaseTool {
  cacheIndex = 0;
  constructor(
    protected viewportService: ViewportService,
    protected logger: LoggerService,
    protected panTool: PanTool
  ) {
    super();
    this.viewportService.transformed
      .subscribe(() => {
        this.cacheIndex++;
        this.trackMousePos(this.currentArgs);
        this.updateSelectorUi();
      });

    this.viewportService.viewportResize.subscribe(() => {
      this.updateSelectorUi();
    });
  }

  iconName = "navigation";
  selectionRectElement: HTMLElement;

  protected containerRect: DOMRect = null;
  protected selectionRect: DOMRect = null;
  protected startPos: DOMPoint = null;
  protected currentArgs: MouseEventArgs = null;
  private updating = false;
  private autoPanIntervalRef = null;
  autoPanSpeed = 0;
  init(element: HTMLElement) {
    this.selectionRectElement = element;
  }

  onViewportMouseDown(e: MouseEventArgs) {
    this.startPos = this.trackMousePos(e);
    this.containerRect = this.viewportService.getContainerClientRect();
    const bounds = this.viewportService.getDisplayedBounds();
    if (bounds) {
      const zoom = this.viewportService.getZoom();
      this.autoPanSpeed =
        consts.autoPanSpeed * zoom * Math.abs(bounds.from.x - bounds.to.x);
    }

    this.selectionStarted(e);
  }

  onWindowBlur(e) {
    if (this.startPos) {
      this.selectionEnded(e, this.selectionRect);
    }

    this.cleanUp();
  }

  onWindowMouseUp(e: MouseEventArgs) {
    if (!this.startPos) {
      return;
    }

    try {
      this.currentArgs = e;
      this.trackMousePos(e);
      this.selectionEnded(e, this.selectionRect);
    } finally {
      this.cleanUp();
    }
  }

  selectionStarted(e: MouseEventArgs) {}
  selectionUpdate(e: MouseEventArgs, selectedArea: DOMRect) {}
  selectionEnded(e: MouseEventArgs, selectedArea: DOMRect) {}

  onWindowMouseMove(event: MouseEventArgs) {
    if (!this.startPos) {
      return;
    }

    event.preventDefault();
    this.currentArgs = event;
    this.trackMousePos(event);
    this.updateSelectorUi();
    this.startAutoPan();
    this.selectionUpdate(event, this.selectionRect);
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
    // Pan by scroll
    if (!mousePosition || !this.autoPanSpeed) {
      return;
    }

    const pan = this.viewportService.getPan();
    let done = false;
    // TODO: determine autopan automatically.
    const panByMouseSpeed = this.autoPanSpeed;
    if (mousePosition.x < containerSize.left) {
      pan.x += panByMouseSpeed;
      done = true;
    } else if (mousePosition.x > containerSize.left + containerSize.width) {
      pan.x -= panByMouseSpeed;
      done = true;
    }

    if (mousePosition.y < containerSize.top) {
      pan.y += panByMouseSpeed;
      done = true;
    } else if (mousePosition.y > containerSize.top + containerSize.height) {
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
    if (this.updating) {
      return;
    }

    this.updating = true;

    if (!this.selectionRect) {
      if (
        this.selectionRectElement &&
        this.selectionRectElement.getAttribute("display") !== "none"
      ) {
        this.selectionRectElement.setAttribute("display", "none");
      }
      this.updating = false;
      return;
    }

    const rect = this.viewportService.matrixRectTransform(
      this.selectionRect,
      this.viewportService.getCTM()
    );
    const matrix = this.viewportService.viewport.ownerSVGElement
      .createSVGMatrix()
      .translate(rect.x, rect.y);

    this.viewportService.setCTMForElement(this.selectionRectElement, matrix);
    this.selectionRectElement.setAttribute("display", "initial");
    const w = (Math.round(rect.width * 100) / 100).toString();
    this.selectionRectElement.setAttribute("width", w);
    const h = (Math.round(rect.height * 100) / 100).toString();
    this.selectionRectElement.setAttribute("height", h);
    this.updating = false;
  }

  getMousePos(event: MouseEventArgs) {
    const point = this.viewportService.toSvgPoint(
      event.clientX - this.containerRect.left,
      event.clientY - this.containerRect.top,
      true
    );
    return point;
  }

  trackMousePos(event: MouseEventArgs) {
    if (!event) {
      return;
    }

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
    } else {
      if (!this.selectionRect) {
        this.selectionRect = new DOMRect(pos.x, pos.y, 1, 1);
      }
    }

    return pos;
  }
}
