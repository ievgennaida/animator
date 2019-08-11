import { valuesProp } from "./valuesProp";

export interface offsetKeyframe {
  /**
   * Bezier curve interpolation in value.
   */
  i?: valuesProp;
  /**
   * Bezier curve interpolation out value.
   */
  o?: valuesProp;
  /**
   * Start value of keyframe segment.
   */
  s?: number[];
  /**
   * Start time of keyframe segment.
   */
  t?: number;

  n?: string[];
}
