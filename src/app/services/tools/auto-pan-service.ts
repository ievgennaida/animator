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
  private autoPanSpeed = 0;
  private autoPanIntervalRef?: number;
  private clientX = 0;
  private clientY = 0;
  private autoPanInterval = 50;
  private containerRect: DOMRect | null = null;
  private active = true;
  constructor(
    protected logger: LoggerService,
    protected panTool: PanTool,
    protected viewService: ViewService
  ) {}
  public isActive(): boolean {
    return this.active;
  }

  stop(): void {
    this.containerRect = null;
    this.active = false;
    if (this.autoPanIntervalRef) {
      clearInterval(this.autoPanIntervalRef);
      this.autoPanIntervalRef = 0;
    }
  }

  update(clientX: number, clientY: number): void {
    this.clientX = clientX;
    this.clientY = clientY;
    this.containerRect =
      this.containerRect || this.viewService.getContainerClientRect();
    if (!this.containerRect) {
      console.log("Auto pan failed. Container cannot be null.");
      return;
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
        this.autoPanIntervalRef = window.setInterval(() => {
          this.autoPanAction(this.clientX, this.clientY, this.containerRect);
        }, this.autoPanInterval);
      }
    }
  }
  private autoPanAction(
    x: number,
    y: number,
    containerSize: DOMRect | null
  ): boolean {
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
}
