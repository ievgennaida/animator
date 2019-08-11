import { baseShape } from "./baseShape";
import { multiDimensional } from "../properties/multiDimensional";
import { valueKeyframed } from "../properties/valueKeyframed";
import { gradientType } from "../helpers/gradientType";

export class gFill extends baseShape {
  /**
   * Gradient Colors
   */
  g: any;
  /**
   * Gradient Type
   */
  t: gradientType;
  /**
   * Highlight Length. Gradient Highlight Length. Only if type is Radial
   */
  h: valueKeyframed;

  /**
   * Highlight Angle. Highlight Angle. Only if type is Radial
   */
  a: valueKeyframed;

  /**
   * Opacity. Stroke Opacity
   */
  o: valueKeyframed;

  /**
   * Start Point. Gradient Start Point
   */
  s?: multiDimensional;
  /**
   * End Point. Gradient End Point
   */
  e?: multiDimensional;
}
