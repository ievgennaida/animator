import { valueKeyframe } from "./valueKeyframe";

export interface valueKeyframed {
  /**
   * Keyframes. Property Value keyframes
   */
  k?: valueKeyframe[];
  /**
   * Property Index. Used for expressions.
   */
  ix?: string;
  /**
   * Expression. Property Expression. An AE expression that modifies the value.
   */
  x?: string;
}
