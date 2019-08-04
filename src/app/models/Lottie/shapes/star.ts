import { value } from "../properties/value";
import { valueKeyframed } from "../properties/valueKeyframed";
import { multiDimensional } from "../properties/multiDimensional";
import { multiDimensionalKeyframed } from "../properties/multiDimensionalKeyframed";

import { baseShape } from "./baseShape";

export class star extends baseShape {
  /**
   * After Effect's Direction. Direction how the shape is drawn. Used for trim path for
   * example.
   */
  d?: number;

  /**
   * Inner Radius.Star's inner radius. (Star only)
   */
  ir: value | valueKeyframed;

  /**
   * Inner Roundness. Star's inner roundness. (Star only)
   */
  is: value | valueKeyframed;

  /**
   * Outer Radius. Star's outer radius..
   */
  or: value | valueKeyframed;
  /**
   * Outer Roundness. Star's outer roundness.
   */
  os: value | valueKeyframed;

  /**
   * Rotation. Star's rotation.
   */
  r: value | valueKeyframed;

  /**
   * Points. Star's number of points
   */
  pt: value | valueKeyframed;

  /**
   * Star Type. Star's type. Polygon or Star.
   */
  sy: value | valueKeyframed;

  /**
   * Position. Star's position
   */
  p?: multiDimensional | multiDimensionalKeyframed;
}
