import { offsetKeyframe } from "./offsetKeyframe";

export interface multiDimensionalKeyframed {
  /**
   * Keyframes. Property Value keyframes
   */
  k?: offsetKeyframe[];
  /**
   * Property Index. Used for expressions.
   */
  ix?: string;
  /**
   * In Spatial Tangent. Only for spatial properties. Array of numbers.
   */
  ti?: any[];
  /**
   * Out Spatial Tangent. Only for spatial properties. Array of numbers.
   */
  to?: any[];
  /**
   * Property Expression. An AE expression that modifies the value.
   */
  x?: string;
}
