import { shapeProp } from "./shapeProp";
import { baseProperty } from './baseProperty';

export interface shape extends baseProperty {
  /**
   *Property Value
   */
  k: shapeProp[];
  /**
   * Animated. Defines if property is animated
   */
  a?: number;
}
