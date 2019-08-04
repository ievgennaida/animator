import { shapeProp } from "./shapeProp";

export interface shape {
  /**
   *Property Value
   */
  k: shapeProp[];
  /**
   * Animated. Defines if property is animated
   */
  a?: number;
  /**
   * Property Index. Property Index. Used for expressions.
   */
  ix?: string;
  /**
   * Expression. Property Expression. An AE expression that modifies the value.
   */
  x?: string;
}
