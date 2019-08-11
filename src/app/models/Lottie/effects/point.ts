import { baseEffect } from "./baseEffect";
import { multiDimensional } from "../properties/multiDimensional";

export class point extends baseEffect {
  /**
   * Value. Effect value.
   */
  v?: multiDimensional;
}
