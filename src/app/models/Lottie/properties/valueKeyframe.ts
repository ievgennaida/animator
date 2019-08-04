import { valueProp } from './valuesProp';

export interface valueKeyframe {
  /**
   * interpolation in value.
   */
  i?: valueProp;
  /**
   * Start value of keyframe segment.
   */
  s?: number;
  /**
   * Start time of keyframe segment.
   */
  t?: number;
}

