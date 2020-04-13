import { PathDataCommand } from './path-data-command';

/**
 * quadratic Bézier curveto.
 * Draws a quadratic Bézier curve from the current point to (x,y) using (x1,y1)
 * as the control point. Q (uppercase) indicates that absolute coordinates will follow;
 * q (lowercase) indicates that relative coordinates will follow.
 */
export class QPathDataCommand extends PathDataCommand {
    public a: DOMPoint;
    update() {
      if (!this.a) {
        this.a = new DOMPoint();
      }
      this.a.x = this.values[0];
      this.a.y = this.values[1];
    }
  }