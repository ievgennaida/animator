import { PathDataCommand } from "./path-data-command";

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
export class CPathDataCommand extends PathDataCommand {
  public a: DOMPoint;
  public b: DOMPoint;
  update() {
    if (!this.a) {
      this.a = new DOMPoint();
    }
    if (!this.b) {
      this.b = new DOMPoint();
    }
    this.a.x = this.values[0];
    this.a.y = this.values[1];
    this.b.x = this.values[2];
    this.b.y = this.values[3];
  }
}
