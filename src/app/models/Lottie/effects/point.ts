import { baseEffect } from "./baseEffect";
import { multiDimensional } from "../properties/multiDimensional";
import { multiDimensionalKeyframed } from "../properties/multiDimensionalKeyframed";

export class point extends baseEffect {
  /**
   * Value. Effect value.
   */
  v?: multiDimensional | multiDimensionalKeyframed;
}
