/**
 * Normilize different event args to be generic.
 */
export class MouseEventArgs {
  clientX = 0;
  clientY = 0;
  touchDistance = 1;
  // Normalized deltaY
  deltaY = 0;
  handled = false;
  args: MouseEvent | TouchEvent | WheelEvent;

  constructor(event: MouseEvent | WheelEvent | TouchEvent) {
    this.args = event;

    if (!event) {
      return;
    }

    this.args.preventDefault();

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
        this.clientX = event.touches[0].clientX;
        this.clientY = event.touches[0].clientX;
      }
    }

    if(event instanceof MouseEvent) {
      this.clientX = event.clientX;
      this.clientY = event.clientY;
    }
  }
}
