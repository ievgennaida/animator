/**
 * Path data command base interface.
 * Should be replaced by a DOM type when available.
 * https://www.w3.org/TR/SVG/paths.html
 */
export interface SVGPathSegmentEx {
  type: string;
  values: number[];
}
