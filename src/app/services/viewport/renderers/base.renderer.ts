export class BaseRenderer {
  canvasCTM: DOMMatrix = new DOMMatrix();
  devicePixelRatio = window.devicePixelRatio;
  // TODO: use one pixel for different devices to draw lines sharp
  onePixel = this.devicePixelRatio;
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

  getSharpPos(point: DOMPoint, thinkess = 1) {
    point.x = this.getSharp(point.x, thinkess);
    point.y = this.getSharp(point.y, thinkess);
    return point;
  }

  getSharp(pos: number, thinkess = this.devicePixelRatio): number {
    const offset = this.onePixel/2;
    pos = Math.floor(pos) + offset;
    return pos;
  }
}
