import { multiDimensional } from "../properties/multiDimensional";
import { multiDimensionalKeyframed } from "../properties/multiDimensionalKeyframed";
import { valueKeyframed } from "../properties/valueKeyframed";
import { value } from "../properties/value";
import { lineCap } from "../helpers/lineCap";
import { lineJoint } from "../helpers/lineJoin";
import { baseShape } from "./baseShape";

export class stroke extends baseShape {
  /**
   * Miter Limit. Miter Limit. Only if Line Join is set to Miter.
   */
  ml: number;

  /**
   * Line Join
   */
  lg: lineJoint;

  /*
   * Line Cap.Gradient Stroke Line Cap
   */
  lc: lineCap;

  /**
   * Opacity. Stroke Opacity
   */
  o: value | valueKeyframed;
  /**
   * Width. Stroke Width
   */
  w: value | valueKeyframed;

  /**
   * Color. Stroke Color
   */
  c?: multiDimensional | multiDimensionalKeyframed;
}
