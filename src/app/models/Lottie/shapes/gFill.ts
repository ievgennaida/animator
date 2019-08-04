import { baseShape } from './baseShape';
import { multiDimensional } from "../properties/multiDimensional";
import { multiDimensionalKeyframed } from "../properties/multiDimensionalKeyframed";
import { valueKeyframed } from "../properties/valueKeyframed";
import { value } from "../properties/value";
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
  h: value | valueKeyframed;

  /**
   * Highlight Angle. Highlight Angle. Only if type is Radial
   */
  a: value | valueKeyframed;

  /**
   * Opacity. Stroke Opacity
   */
  o: value | valueKeyframed;

  /**
   * Start Point. Gradient Start Point
   */
  s: multiDimensional | multiDimensionalKeyframed;
  /**
   * End Point. Gradient End Point
   */
  e: multiDimensional | multiDimensionalKeyframed;
}
