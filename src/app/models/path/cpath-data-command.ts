import { PathDataCommand, OneHandleDataCommand } from "./path-data-command";

/**
 * W3 https://www.w3.org/TR/SVG/paths.html
 * Draws a cubic Bézier curve from the current point to (x,y)
 * using (x1,y1) as the control point at the beginning of the curve and (x2,y2)
 * as the control point at the end of the curve. C (uppercase)
 * indicates that absolute coordinates will follow; c (lowercase)
 * indicates that relative coordinates will follow.
 * Multiple sets of coordinates may be specified to draw a polybézier.
 * At the end of the command, the new current point becomes the final (x,y)
 * coordinate pair used in the polybézier.
 */
export class CPathDataCommand extends OneHandleDataCommand {
  // tslint:disable-next-line: variable-name
  public _b: DOMPoint;
  public get b(): DOMPoint {
    if (!this._b) {
      this._b = new DOMPoint();
    }
    this._b.x = this.values[2];
    this._b.y = this.values[3];
    return this._b;
  }
  public set b(point: DOMPoint) {
    this._b = point;
    this.values[2] = point.x;
    this.values[3] = point.y;
  }

  public offsetHandles(x: number, y: number) {
    super.offsetHandles(x, y);
    const b = this.b;
    b.x += x;
    b.y += y;
    this.b = b;
  }
}
