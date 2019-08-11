import { offsetKeyframe } from "./offsetKeyframe";
import { baseProperty } from './baseProperty';

export interface multiDimensionalKeyframed extends baseProperty {
  /**
   * Keyframes. Property Value keyframes
   */
  k?: offsetKeyframe[];
}
