import { baseShape } from "./baseShape";
import { multiDimensional } from "../properties/multiDimensional";
import { multiDimensionalKeyframed } from "../properties/multiDimensionalKeyframed";
import { valueKeyframed } from "../properties/valueKeyframed";
import { value } from "../properties/value";
import { gradientType } from "../helpers/gradientType";
import { lineJoint } from "../helpers/lineJoin";
import { lineCap } from '../helpers/lineCap';

export class gStroke extends baseShape {
  /**
   * Gradient Colors
   */
  g: any;

  /**
   * Miter Limit. Gradient Stroke Miter Limit. Only if Line Join is set to Miter.
   */
  ml: number;
  /**
   * Gradient Type
   */
  t: gradientType;
  /**
   * Line Join Gradient Stroke Line Join
   */
  lg: lineJoint;

  /**
   * Stroke Width. Gradient Stroke Width
   */
  w: value | valueKeyframed;

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

  /*
   * Line Cap.Gradient Stroke Line Cap
   */
  lc: lineCap;

  /**
   * Start Point. Gradient Start Point
   */
  s: multiDimensional | multiDimensionalKeyframed;
  /**
   * End Point. Gradient End Point
   */
  e: multiDimensional | multiDimensionalKeyframed;
}
