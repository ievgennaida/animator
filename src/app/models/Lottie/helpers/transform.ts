
import { valueKeyframed } from "../properties/valueKeyframed";
import { multiDimensional } from "../properties/multiDimensional";

export class transform {
  /**
   * Rotation. Transform Rotation{"a":0, "k":0},
   */
  r: valueKeyframed;

  /**
   * Opacity. Transform Opacity{"a":0, "k":100},
   */
  o: valueKeyframed;

  /**
   * Position X. Transform Position X{"a":0, "k":0},
   */
  px?: valueKeyframed;

  /**
   * Position Y. Transform Position Y{"a":0, "k":0},
   */
  py?: valueKeyframed;

  /**
   * Position Z. Transform Position Z{"a":0, "k":0},
   */
  pz?: valueKeyframed;

  /**
   * Skew. Transform Skew {"a":0, "k":0},
   */
  sk: valueKeyframed;
  
  /**
   * Skew Axis. Transform Skew Axis {"a":0, "k":0},
   */
  sa: valueKeyframed;

  /**
   * Anchor Point. Transform Anchor Point  "default": {"a":0, "k":[0, 0, 0]},
   */
  a?: multiDimensional;

  /**
   * Position. Transform Position  "default": {"a":0, "k":[0, 0, 0]},
   */
  p?: multiDimensional;

  /**
   * Scale. Transform Scale.     "default": {"a":0, "k":[100, 100, 100]},
   */
  s?: multiDimensional;
}
