import { valuesProp } from "./valuesProp";
import { shapeProp } from "./shapeProp";

export interface shapePropKeyframe {
  /**
   * Start. Start value of keyframe segment.
   */
  s?: shapeProp[];
  /**
   * Bezier curve interpolation in value.
   */
  i?: valuesProp;
  /**
   * Bezier curve interpolation out value.
   */
  o?: valuesProp;
  /**
   * Time. Start time of keyframe segment.
   */
  t?: number;
}
