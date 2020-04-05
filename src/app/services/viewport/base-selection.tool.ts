import { BaseTool } from "./base.tool";
import { MouseEventArgs } from "./mouse-event-args";
import { ViewService } from "../view.service";
import { LoggerService } from "../logger.service";
import { PanTool } from "./pan.tool";
import { consts } from "src/environments/consts";
import { TransformsService } from "./transformations/transforms.service";
import { SelectorRenderer } from "./renderers/selector.renderer";

export class BaseSelectionTool extends BaseTool {
  cacheIndex = 0;

  constructor(
    protected selectorRenderer: SelectorRenderer,
    protected transformsService: TransformsService,
    protected viewService: ViewService,
    protected logger: LoggerService,
    protected panTool: PanTool
  ) {
    super();
    this.viewService.resized.subscribe(() => {
      this.trackMousePos(this.currentArgs);
      this.selectorRenderer.setRect(this.selectionRect);
    });
  }

  iconName = "navigation";
  protected containerRect: DOMRect = null;
  protected selectionRect: DOMRect = null;
  protected startPos: DOMPoint = null;
  protected currentArgs: MouseEventArgs = null;
  protected click = false;

  private autoPanIntervalRef = null;
  autoPanSpeed = 0;

  onViewportMouseDown(e: MouseEventArgs) {
    this.startPos = this.trackMousePos(e);
    this.containerRect = this.viewService.getContainerClientRect();
    const bounds = this.viewService.getDisplayedBounds();
    if (bounds) {
      const zoom = this.viewService.getZoom();
      this.autoPanSpeed =
        consts.autoPanSpeed * zoom * Math.abs(bounds.from.x - bounds.to.x);
    }
    this.click = true;
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
  selectionUpdate(event: MouseEventArgs, selectedArea: DOMRect) {}
  selectionEnded(e: MouseEventArgs, selectedArea: DOMRect) {}

  onWindowMouseMove(event: MouseEventArgs) {
    if (!this.startPos) {
      return;
    }
    event.preventDefault();
    try {
      this.selectorRenderer.suspend();
      this.selectorRenderer.setRect(this.selectionRect);
      this.currentArgs = event;
      this.trackMousePos(event);
      this.startAutoPan();
      this.selectionUpdate(event, this.selectionRect);
    } finally {
      this.selectorRenderer.resume();
    }
  }

  cleanUp() {
    this.selectionRect = null;
    this.startPos = null;
    this.currentArgs = null;
    this.containerRect = null;
    this.click = false;
    this.stopAutoPan();
    this.selectorRenderer.setRect(this.selectionRect);
  }

  autoPan(mousePosition: DOMPoint, containerSize: DOMRect) {
    // Pan by scroll
    if (!mousePosition || !this.autoPanSpeed) {
      return;
    }

    const pan = this.viewService.getPan();
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

  getMousePos(event: MouseEventArgs) {
    const point = this.viewService.toSvgPoint(
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
      this.containerRect = this.viewService.getContainerClientRect();
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
      if (this.click) {
        this.click =
          this.selectionRect.width <= consts.clickThreshold &&
          this.selectionRect.height <= consts.clickThreshold;
      }
    } else {
      if (!this.selectionRect) {
        this.selectionRect = new DOMRect(pos.x, pos.y, 1, 1);
      }
    }

    return pos;
  }
}
