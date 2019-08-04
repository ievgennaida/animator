import { shapePropKeyframe } from "./shapePropKeyframe";

export interface shapeKeyframed {
  /**
   * Property Value keyframes
   */
  k: shapePropKeyframe[];

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
