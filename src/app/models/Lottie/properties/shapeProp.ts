export interface shapeProp {
  /**
   * Closed property of shape
   */
  c?: boolean;
  /**
   * Bezier curve In points. Array of 2 dimensional arrays.
   */
  i?: Array<number[]>;
  /**
   * Bezier curve Out points. Array of 2 dimensional arrays.
   */
  o?: Array<number[]>;
  /**
   * Bezier curve Vertices. Array of 2 dimensional arrays.
   */
  v?: Array<number[]>;
}
