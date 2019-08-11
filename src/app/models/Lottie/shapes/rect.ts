import { multiDimensional } from "../properties/multiDimensional";
import { baseShape } from "./baseShape";

import { valueKeyframed } from "../properties/valueKeyframed";

export class rect extends baseShape {
  /**
   * After Effect's Direction. Direction how the shape is drawn. Used for trim path for example.
   */
  d: number = 1;

  /**
   * Rounded corners. Rect's rounded corners
   */
  r: valueKeyframed;

  /**
   * Position. Rect's position
   */
  p?: multiDimensional;
  /**
   * Size. Rect's Size
   */
  s?: multiDimensional;
}
