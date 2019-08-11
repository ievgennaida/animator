import { valueKeyframe } from "./valueKeyframe";
import { baseProperty } from './baseProperty';

export interface valueKeyframed extends baseProperty {
  /**
   * Keyframes. Property Value keyframes
   */
  k: number | valueKeyframe[];
}
