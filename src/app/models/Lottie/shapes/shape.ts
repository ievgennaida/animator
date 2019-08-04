import { baseShape } from "./baseShape";
import { shapeKeyframed } from "../properties/shapeKeyframed";

export class shape extends baseShape {
  /**
   * After Effect's Direction. Direction how the shape is drawn. Used for trim path for
   * example.
   */
  d?: number;
  /**
   * Vertices.  Shape's vertices
   */
  ks: shape | shapeKeyframed;
}
