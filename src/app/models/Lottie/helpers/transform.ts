import { value } from "../properties/value";
import { valueKeyframed } from "../properties/valueKeyframed";
import { multiDimensional } from "../properties/multiDimensional";
import { multiDimensionalKeyframed } from "../properties/multiDimensionalKeyframed";

export class transform {
  /**
   * Rotation. Transform Rotation{"a":0, "k":0},
   */
  r: value | valueKeyframed;

  /**
   * Opacity. Transform Opacity{"a":0, "k":100},
   */
  o: value | valueKeyframed;

  /**
   * Position X. Transform Position X{"a":0, "k":0},
   */
  px?: value | valueKeyframed;

  /**
   * Position Y. Transform Position Y{"a":0, "k":0},
   */
  py?: value | valueKeyframed;

  /**
   * Position Z. Transform Position Z{"a":0, "k":0},
   */
  pz?: value | valueKeyframed;

  /**
   * Skew. Transform Skew {"a":0, "k":0},
   */
  sk: value | valueKeyframed;
  
  /**
   * Skew Axis. Transform Skew Axis {"a":0, "k":0},
   */
  sa: value | valueKeyframed;

  /**
   * Anchor Point. Transform Anchor Point  "default": {"a":0, "k":[0, 0, 0]},
   */
  a: multiDimensional | multiDimensionalKeyframed;

  /**
   * Position. Transform Position  "default": {"a":0, "k":[0, 0, 0]},
   */
  p: multiDimensional | multiDimensionalKeyframed;

  /**
   * Scale. Transform Scale.     "default": {"a":0, "k":[100, 100, 100]},
   */
  s: multiDimensional | multiDimensionalKeyframed;
}
