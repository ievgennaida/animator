import { Injectable } from "@angular/core";
import { MouseEventArgs } from "src/app/models/mouse-event-args";
import { consts } from "src/environments/consts";
import { LoggerService } from "../logger.service";
import { SelectorRenderer } from "../renderers/selector.renderer";
import { MatrixUtils } from "../utils/matrix-utils";
import { Utils } from "../utils/utils";
import { ViewService } from "../view.service";

/**
 * Track selection rectangle size.
 */
@Injectable({
  providedIn: "root",
})
export class SelectionRectTracker {
  /**
   * Current selection rectangle
   */
  rect: DOMRect | null = null;
  /**
   * Last used event args.
   */
  public args: MouseEventArgs | null = null;

  /**
   * Whether current react is a click actually.
   */
  public click = false;
  public moved = false;
  public startScreenPos: DOMPoint | null = null;
  public allowRectSelection = true;

  protected startPos: DOMPoint | null = null;
  constructor(
    protected logger: LoggerService,
    protected viewService: ViewService,
    protected selectorRenderer: SelectorRenderer
  ) {
    this.viewService.resized.subscribe(() => {
      this.trackMousePos(this.args);
      if (this.allowRectSelection) {
        this.selectorRenderer.setRect(this.rect);
      }
    });
  }
  getScreenRect(): DOMRect | null {
    if (!this.rect) {
      return null;
    }

    return MatrixUtils.matrixRectTransform(
      this.rect,
      this.viewService.getScreenCTM()
    );
  }
  selectionRectStarted(): boolean {
    const active = this.allowRectSelection && this.isActive() && !this.click;
    return active;
  }
  isActive(): boolean {
    return !!this.startPos;
  }
  update(e: MouseEventArgs): boolean {
    if (!this.isActive()) {
      return false;
    }
    if (!this.selectionRectStarted()) {
      this.args = e;
      this.trackMousePos(e);
      return true;
    }

    this.selectorRenderer.runSuspended(() => {
      this.selectorRenderer.setRect(this.rect);
      this.args = e;
      this.trackMousePos(e);
    }, false);
    return true;
  }
  start(e: MouseEventArgs, allowRectSelection = true) {
    this.allowRectSelection = allowRectSelection;
    this.startScreenPos = e.getDOMPoint();
    this.startPos = this.trackMousePos(e);
    this.click = true;
    this.moved = false;
  }
  stop() {
    this.rect = null;
    this.startPos = null;
    this.startScreenPos = null;
    this.args = null;
    this.click = false;
    this.moved = false;
    this.allowRectSelection = true;
    this.selectorRenderer.clear();
  }

  trackMousePos(event: MouseEventArgs | null): DOMPoint | null {
    if (!event) {
      return null;
    }

    const pos = Utils.toElementPoint(this.viewService, event.screenPoint);
    if (!pos) {
      return null;
    }
    if (this.startPos) {
      if (!this.rect) {
        this.rect = new DOMRect();
      }

      // get the pos with the virtualization:
      this.rect.x = Math.min(this.startPos.x, pos.x);
      this.rect.y = Math.min(this.startPos.y, pos.y);
      this.rect.width = Math.max(this.startPos.x, pos.x) - this.rect.x;
      this.rect.height = Math.max(this.startPos.y, pos.y) - this.rect.y;
      this.moved = this.rect.width > 0 || this.rect.height > 0;
      if (this.click) {
        this.click =
          this.rect.width <= consts.clickThreshold &&
          this.rect.height <= consts.clickThreshold;
      }
    } else {
      if (!this.rect && pos) {
        this.rect = new DOMRect(pos.x, pos.y, 1, 1);
      }
    }

    return pos;
  }
}
