import { Injectable } from "@angular/core";
import { consts } from "src/environments/consts";
import { LoggerService } from "../logger.service";
import { ViewService } from "../view.service";
import { PanTool } from "./pan.tool";

/**
 * Allow to repeat pan when mouse over some bounds.
 */
@Injectable({
  providedIn: "root",
})
export class AutoPanService {
  constructor(
    protected logger: LoggerService,
    protected panTool: PanTool,
    protected viewService: ViewService
  ) {}

  private autoPanSpeed = 0;
  private autoPanIntervalRef = null;
  private clientX = 0;
  private clientY = 0;
  private autoPanInterval = 50;
  private containerRect: DOMRect | null = null;
  private active = true;
  public isActive(): boolean {
    return this.active;
  }
  private autoPanAction(x: number, y: number, containerSize: DOMRect): boolean {
    // Pan by scroll
    if (!this.autoPanSpeed || !containerSize) {
      return false;
    }

    const pan = this.panTool.getPan();
    let done = false;
    // TODO: determine auto pan automatically.
    const panByMouseSpeed = this.autoPanSpeed;
    if (x < containerSize.left) {
      pan.x += panByMouseSpeed;
      done = true;
    } else if (x > containerSize.left + containerSize.width) {
      pan.x -= panByMouseSpeed;
      done = true;
    }

    if (y < containerSize.top) {
      pan.y += panByMouseSpeed;
      done = true;
    } else if (y > containerSize.top + containerSize.height) {
      pan.y -= panByMouseSpeed;
      done = true;
    }

    if (done) {
      this.panTool.pan(pan.x, pan.y);
    }

    return done;
  }
  stop() {
    this.containerRect = null;
    this.active = false;
    if (this.autoPanIntervalRef) {
      clearInterval(this.autoPanIntervalRef);
      this.autoPanIntervalRef = null;
    }
  }

  update(clientX: number, clientY: number) {
    this.clientX = clientX;
    this.clientY = clientY;

    if (!this.containerRect) {
      this.containerRect = this.viewService.getContainerClientRect();
    }

    const bounds = this.viewService.getDisplayedBounds();
    if (bounds) {
      const zoom = this.viewService.getZoom();
      this.autoPanSpeed = consts.autoPanSpeed * zoom * Math.abs(bounds.width);
    }

    const performed = this.autoPanAction(
      this.clientX,
      this.clientY,
      this.containerRect
    );
    if (performed) {
      this.active = true;
      if (!this.autoPanIntervalRef) {
        // Repeat move calls to
        this.autoPanIntervalRef = setInterval(() => {
          this.autoPanAction(this.clientX, this.clientY, this.containerRect);
        }, this.autoPanInterval);
      }
    }
  }
}
