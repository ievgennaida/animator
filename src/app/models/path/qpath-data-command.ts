import { OneHandleDataCommand } from "./path-data-command";

/**
 * W3 https://www.w3.org/TR/SVG/paths.html
 * quadratic Bézier curveto.
 * Draws a quadratic Bézier curve from the current point to (x,y) using (x1,y1)
 * as the control point. Q (uppercase) indicates that absolute coordinates will follow;
 * q (lowercase) indicates that relative coordinates will follow.
 * (x1 y1 x y)
 */
export class QPathDataCommand extends OneHandleDataCommand {
}
