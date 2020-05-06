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
  args: MouseEvent | TouchEvent | WheelEvent;
  /**
   * Screen DOM point.
   */
  screenPoint: DOMPoint;

  /**
   * viewport Point
   */
  viewportPoint: DOMPoint;
  preventDefault() {
    if (this.args) {
      this.args.preventDefault();
    }
  }

  rightClicked() {
    // tslint:disable-next-line: deprecation
    const e: any = this.args || window.event;
    if (!e) {
      return false;
    }
    if ("which" in e)
      // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
      return e.which === 3;
    else if ("button" in e) return e.button === 2;
    return false;
  }

  stopPropagation() {
    if (this.args) {
      this.args.stopPropagation();
    }
  }

  getDOMPoint() {
    return this.screenPoint;
  }

  constructor(event: MouseEvent | WheelEvent | TouchEvent) {
    this.args = event;

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
      // tslint:disable-next-line: no-string-literal
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
}
