import { baseEffect } from "./baseEffect";
import { multiDimensional } from "../properties/multiDimensional";
import { multiDimensionalKeyframed } from "../properties/multiDimensionalKeyframed";

export class color extends baseEffect {
  /**
   * Value. Effect value.
   */
  v: multiDimensional | multiDimensionalKeyframed;
}
