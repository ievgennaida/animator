import { value } from "../properties/value";
import { valueKeyframed } from "../properties/valueKeyframed";
import { multiDimensional } from "../properties/multiDimensional";
import { multiDimensionalKeyframed } from "../properties/multiDimensionalKeyframed";
import { baseShape } from './baseShape';

export interface transform extends baseShape  {

  /**
   * Rotation. Shape Transform Rotation
   */
  r: value | valueKeyframed;

  /**
   * Opacity. Shape Transform Opacity
   */
  o: value | valueKeyframed;

  /**
   * Skew. Shape Transform Skew
   */
  sk: value | valueKeyframed;

  /**
   * Skew Axis. Shape Transform Skew Axis
   */
  sa: value | valueKeyframed;
  /**
   * Anchor Point. Shape Transform Anchor Point
   */
  a: multiDimensional | multiDimensionalKeyframed;
  /**
   * Position. Shape Transform Position
   */
  p: multiDimensional | multiDimensionalKeyframed;
  /**
   * Scale. Shape Transform Scale
   */
  s: multiDimensional | multiDimensionalKeyframed;
}
