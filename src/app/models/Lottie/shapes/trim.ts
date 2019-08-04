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
  /**
   * After Effect's Match Name. Used for expressions.
   */
  mn?: string;
  /**
   * After Effect's Name. Used for expressions.
   */
  nm?: string;
  /**
   * Shape content type.
   */
  ty?: string;
}
