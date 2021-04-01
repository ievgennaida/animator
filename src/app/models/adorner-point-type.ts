/**
 * Adorner point
 */
export enum AdornerPointType {
  none,

  topLeft,
  topCenter,
  topRight,
  bottomLeft,
  bottomCenter,
  bottomRight,
  leftCenter,
  rightCenter,
  /**
   * Center of the transformation to be applied.
   */
  centerTransform,
  /**
   * Center of the adorner.
   */
  center,
  rotateTopLeft,
  rotateTopCenter,
  rotateTopRight,
  rotateBottomLeft,
  rotateBottomCenter,
  rotateBottomRight,
  rotateLeftCenter,
  rotateRightCenter,
  /**
   * Start translate transaction
   */
  translate,
}
