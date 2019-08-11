
import { valueKeyframed } from "../properties/valueKeyframed";
import { multiDimensional } from "../properties/multiDimensional";
import { baseShape } from "./baseShape";

export class fill extends baseShape {
  /**
   * Opacity. Fill Opacity
   */
  o: valueKeyframed;

  /**
   * Color. Fill Color
   */
  c: multiDimensional;
}
