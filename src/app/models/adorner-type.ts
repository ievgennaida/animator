/**
 * Adorner container type.
 */
export enum AdornerType {
  /**
   * Relative bounds, all applied transformations are displayed.
   */
  transformedElement,
  /**
   * Untransformed bounds of the element. Element transformation are ignored.
   */
  elementsBounds,
  /**
   * Selection Rectangle.
   */
  selection,
  /**
   * Selected path data points.
   */
  pathDataSelection,
}
