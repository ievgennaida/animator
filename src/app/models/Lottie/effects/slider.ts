import { baseEffect } from "./baseEffect";
import { value } from "../properties/value";
import { valueKeyframed } from "../properties/valueKeyframed";

export class slider extends baseEffect {
  /**
   * Value. Effect value
   */
  v?: value | valueKeyframed;
}
