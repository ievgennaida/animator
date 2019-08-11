import { baseProperty } from './baseProperty';
import { offsetKeyframe } from './offsetKeyframe';

export interface multiDimensional extends baseProperty {
  /**
   * Property Value
   */
  k?: number[] | offsetKeyframe[];

  /**
   * In Spatial Tangent. Only for spatial properties. Array of numbers.
   */
  ti?: any[];

  /**
   * Out Spatial Tangent. Only for spatial properties. Array of numbers.
   */
  to?: any[];
}
