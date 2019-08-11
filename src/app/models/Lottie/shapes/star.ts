
import { valueKeyframed } from "../properties/valueKeyframed";
import { multiDimensional } from "../properties/multiDimensional";

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
  ir: valueKeyframed;

  /**
   * Inner Roundness. Star's inner roundness. (Star only)
   */
  is: valueKeyframed;

  /**
   * Outer Radius. Star's outer radius..
   */
  or: valueKeyframed;
  /**
   * Outer Roundness. Star's outer roundness.
   */
  os: valueKeyframed;

  /**
   * Rotation. Star's rotation.
   */
  r: valueKeyframed;

  /**
   * Points. Star's number of points
   */
  pt: valueKeyframed;

  /**
   * Star Type. Star's type. Polygon or Star.
   */
  sy: valueKeyframed;

  /**
   * Position. Star's position
   */
  p?: multiDimensional;
}
