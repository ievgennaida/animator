import { baseProperty } from './baseProperty';
import { offsetKeyframe } from './offsetKeyframe';

export interface multiDimensional extends baseProperty {
  /**
   * Property Value
   */
  k?: offsetKeyframe[];
}
