export class BaseRenderer {
  canvasCTM: DOMMatrix = new DOMMatrix();
  devicePixelRatio = window.devicePixelRatio;
  // TODO: use one pixel for different devices to draw lines sharp
  onePixel = this.devicePixelRatio;
  suspended = false;
  invalidated = false;
  public suspend() {
    this.suspended = true;
  }

  public resume() {
    this.suspended = false;
  }

  public invalidate() {
    this.invalidated = true;
  }

  public redrawRequired() {
    return this.invalidated && !this.suspended;
  }

  drawLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }

  clearBackground(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  getDistance(x1: number, y1: number, x2?: number, y2?: number) {
    if (x2 !== undefined && y2 !== undefined) {
      return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    } else {
      return Math.abs(x1 - y1);
    }
  }
  getSharpPos(point: DOMPoint, thinkess = 1) {
    point.x = this.getSharp(point.x, thinkess);
    point.y = this.getSharp(point.y, thinkess);
    return point;
  }

  getSharp(pos: number, thinkess = this.devicePixelRatio): number {
    const offset = this.onePixel / 2;
    pos = Math.floor(pos) + offset;
    return pos;
  }
}
