import { Injectable } from "@angular/core";
import { MouseEventArgs } from "src/app/models/mouse-event-args";
import { consts } from "src/environments/consts";
import { LoggerService } from "../logger.service";
import { Utils } from "../utils/utils";
import { ViewService } from "../view.service";
import { SelectorRenderer } from "./renderers/selector.renderer";

/**
 * Track selection rectangle size.
 */
@Injectable({
  providedIn: "root",
})
export class SelectionRectTracker {
  constructor(
    protected logger: LoggerService,
    protected viewService: ViewService,
    protected selectorRenderer: SelectorRenderer
  ) {
    this.viewService.resized.subscribe(() => {
      this.trackMousePos(this.args);
      this.selectorRenderer.setRect(this.rect);
    });
  }
  /**
   * Current selection rectangle
   */
  rect: DOMRect | null = null;
  protected startPos: DOMPoint | null = null;
  /**
   * Last used event args.
   */
  public args: MouseEventArgs | null = null;

  /**
   * Whether current react is a click actually.
   */
  click = false;
  selectionRectStarted(): boolean {
    const active = this.isActive() && !this.click;
    return active;
  }
  isActive(): boolean {
    return !!this.startPos;
  }
  update(e: MouseEventArgs): boolean {
    if (!this.isActive()) {
      return false;
    }
    this.selectorRenderer.runSuspended(() => {
      this.selectorRenderer.setRect(this.rect);
      this.args = e;
      this.trackMousePos(e);
    }, false);
    return true;
  }
  start(e: MouseEventArgs) {
    this.startPos = this.trackMousePos(e);
    this.click = true;
  }
  stop() {
    this.rect = null;
    this.startPos = null;
    this.args = null;
    this.click = false;
    this.selectorRenderer.clear();
  }

  trackMousePos(event: MouseEventArgs) {
    if (!event) {
      return;
    }

    const pos = Utils.toElementPoint(this.viewService, event.screenPoint);
    if (this.startPos) {
      if (!this.rect) {
        this.rect = new DOMRect();
      }

      // get the pos with the virtualization:
      this.rect.x = Math.min(this.startPos.x, pos.x);
      this.rect.y = Math.min(this.startPos.y, pos.y);
      this.rect.width = Math.max(this.startPos.x, pos.x) - this.rect.x;
      this.rect.height = Math.max(this.startPos.y, pos.y) - this.rect.y;
      if (this.click) {
        this.click =
          this.rect.width <= consts.clickThreshold &&
          this.rect.height <= consts.clickThreshold;
      }
    } else {
      if (!this.rect) {
        this.rect = new DOMRect(pos.x, pos.y, 1, 1);
      }
    }

    return pos;
  }
}
