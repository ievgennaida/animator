export interface valueKeyframe {
  /**
   * Bezier curve interpolation in value.
   */
  i?: InValue;
  /**
   * Start value of keyframe segment.
   */
  s?: number;
  /**
   * Start time of keyframe segment.
   */
  t?: number;
}

/**
 * Bezier curve interpolation in value.
 */
export interface InValue {
  /**
   * bezier x axis
   */
  x?: number;
  /**
   * bezier y axis
   */
  y?: number;
}
