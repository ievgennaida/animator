import { valueKeyframed } from "../properties/valueKeyframed";

import { baseShape } from "./baseShape";

export class trim extends baseShape {
  /**
   * Start. Trim Start.
   */
  s: valueKeyframed;

  /**
   * End. Trim End..
   */

  e: valueKeyframed;
  //
  /**
   * Offset Trim Offset
   */
  o: valueKeyframed;
}
