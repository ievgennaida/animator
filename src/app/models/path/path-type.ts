/**
 * Path data types.
 * W3 https://www.w3.org/TR/SVG/paths.html
 */
export enum PathType {
  /**
   * Arc
   */
  arc = "a",
  /**
   * Move (x,y).
   * Start a new sub-path at the given (x,y) coordinates.
   */
  move = "m",
  /**
   * Line (x,y)
   * Draw a line from the current point to the given (x,y)
   * coordinate which becomes the new current point
   */
  line = "l",
  /**
   * Shorthand/smooth quadratic Bezier curveto
   * (x y)+
   */
  smoothQuadraticBezier = "t",
  /**
   * Cubic Bezier. (x,y; x1,y2; x2,y2)
   * Draws a cubic Bézier curve from the current point to (x,y)
   * using (x1,y1) as the control point at the beginning of the curve and (x2,y2)
   * as the control point at the end of the curve. C (uppercase)
   * indicates that absolute coordinates will follow; c (lowercase)
   * indicates that relative coordinates will follow.
   * Multiple sets of coordinates may be specified to draw a polybézier.
   * At the end of the command, the new current point becomes the final (x,y)
   * coordinate pair used in the polybézier.
   */
  cubicBezier = "c",
  /**
   * quadratic Bézier curveto.
   * Draws a quadratic Bézier curve from the current point to (x,y) using (x1,y1)
   * as the control point. Q (uppercase) indicates that absolute coordinates will follow;
   * q (lowercase) indicates that relative coordinates will follow.
   * (x1 y1 x y)
   */
  quadraticBezier = "q",
  /**
   * S shorthand/smooth curveto.
   * (x2 y2 x y)+
   */
  smoothCubicBezier = "s",
  horizontal = "h",
  vertical = "v",
  close = "z",

  arcAbs = "A",
  moveAbs = "M",
  lineAbs = "L",
  /**
   * C - cubic Bezier (x1 y1 x2 y2 x y)+
   */
  cubicBezierAbs = "C",
  /**
   * Q - quadratic Bezier (x1 y1 x y)+
   */
  quadraticBezierAbs = "Q",
  /**
   * T - Shorthand for Q. (x y)+
   */
  smoothQuadraticBezierAbs = "T",
  /**
   * S - Shorthand for C. (x2 y2 x y)+
   */
  smoothCubicBezierAbs = "S",
  horizontalAbs = "H",
  verticalAbs = "V",
  closeAbs = "Z",
}
