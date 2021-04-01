import { consts } from "src/environments/consts";
import { Utils } from "../services/utils/utils";

/**
 * normalize different event args to be generic.
 */
export class MouseEventArgs {
  clientX = 0;
  clientY = 0;
  touchDistance = 1;
  // Normalized deltaY
  deltaY = 0;
  handled = false;
  ctrlKey = false;
  shiftKey = false;
  executedMs = 0;
  args: MouseEvent | TouchEvent | WheelEvent;
  /**
   * Screen DOM point.
   */
  screenPoint: DOMPoint | null = null;

  /**
   * viewport Point
   */
  viewportPoint: DOMPoint | null = null;
  isDoubleClick = false;
  constructor(event: MouseEvent | WheelEvent | TouchEvent) {
    this.args = event;
    this.executedMs = Date.now();
    if (!event) {
      return;
    }
    this.ctrlKey = this.args.ctrlKey;
    this.shiftKey = this.args.shiftKey;
    if (event instanceof WheelEvent) {
      const wheel = this.args as WheelEvent;
      if (wheel.deltaY < 0) {
        this.deltaY = -1;
      } else if (wheel.deltaY > 0) {
        this.deltaY = 1;
      }
      // eslint-disable-next-line @typescript-eslint/dot-notation
    } else if (window["TouchEvent"] && event instanceof TouchEvent) {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        this.clientX = touch.clientX;
        this.clientY = touch.clientX;
      }
    }

    if (event instanceof MouseEvent) {
      this.clientX = event.clientX;
      this.clientY = event.clientY;
    }
    this.screenPoint = new DOMPoint(this.clientX, this.clientY);
  }
  static getIsDoubleClick(
    args: MouseEventArgs,
    prevArgs: MouseEventArgs
  ): boolean {
    const isDoubleClick =
      prevArgs &&
      // Execution time of prev click
      args.executedMs - prevArgs.executedMs <= consts.doubleClickToleranceMs &&
      // Click was close to the destination
      Utils.getDistance(args.getDOMPoint(), prevArgs.getDOMPoint()) <=
        consts.clickThreshold &&
      !args.rightClicked() &&
      !prevArgs.rightClicked();
    return isDoubleClick;
  }
  preventDefault(): void {
    if (this.args) {
      this.args.preventDefault();
    }
  }
  leftClicked(): boolean {
    // eslint-disable-next-line import/no-deprecated
    const e: any = this.args || window.event;
    if (!e) {
      return false;
    }
    if ("which" in e) {
      // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
      return e.which === 1;
    } else if ("button" in e) {
      return e.button === 0;
    }
    return false;
  }
  rightClicked(): boolean {
    // eslint-disable-next-line import/no-deprecated
    const e: any = this.args || window.event;
    if (!e) {
      return false;
    }
    if ("which" in e) {
      // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
      return e.which === 3;
    } else if ("button" in e) {
      return e.button === 2;
    }
    return false;
  }

  stopPropagation(): void {
    if (this.args) {
      this.args.stopPropagation();
    }
  }

  getDOMPoint(): DOMPoint | null {
    return this.screenPoint;
  }
}
