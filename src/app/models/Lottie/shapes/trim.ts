import { valueKeyframed } from "../properties/valueKeyframed";
import { value } from "../properties/value";
import { baseShape } from "./baseShape";

export class trim extends baseShape {
  /**
   * Start. Trim Start.
   */
  s: value | valueKeyframed;

  /**
   * End. Trim End..
   */

  e: value | valueKeyframed;
  //
  /**
   * Offset Trim Offset
   */
  o: value | valueKeyframed;
}
