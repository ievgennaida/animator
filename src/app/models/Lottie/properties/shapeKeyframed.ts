import { shapePropKeyframe } from "./shapePropKeyframe";
import { baseProperty } from './baseProperty';

export interface shapeKeyframed extends baseProperty {
  /**
   * Property Value keyframes
   */
  k: shapePropKeyframe[];

  /**
   * In Spatial Tangent. Only for spatial properties. Array of numbers.
   */
  ti?: any[];
  /**
   * Out Spatial Tangent. Only for spatial properties. Array of numbers.
   */
  to?: any[];
}
