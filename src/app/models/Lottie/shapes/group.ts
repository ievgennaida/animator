import { baseShape } from "./baseShape";
import { anyShape } from './shapeType';

export class group extends baseShape {
  /**
   * Number of Properties. Group number of properties. Used for expressions
   */
  np?: number;
  /**
   * Items. Group list of items
   */
  it?: anyShape[];
}
