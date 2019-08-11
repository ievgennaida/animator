import { multiDimensional } from "../properties/multiDimensional";
import { baseShape } from "./baseShape";

export class ellipse extends baseShape {
  /**
   * After Effect's Direction. Direction how the shape is drawn. Used for trim path for example.
   */
  d: number = 1;

  /**
   * Position. Ellipse's position
   */
  p?: multiDimensional;

  /**
   * Size. Ellipse's size
   */
  s?: multiDimensional;
}
