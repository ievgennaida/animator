import { offsetKeyframe } from "./offsetKeyframe";
import { baseProperty } from './baseProperty';

export interface multiDimensionalKeyframed extends baseProperty {
  /**
   * Keyframes. Property Value keyframes
   */
  k?: offsetKeyframe[];
  /**
   * In Spatial Tangent. Only for spatial properties. Array of numbers.
   */
  ti?: any[];
  /**
   * Out Spatial Tangent. Only for spatial properties. Array of numbers.
   */
  to?: any[];
}
