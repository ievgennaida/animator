import { effectType } from "./effectType";
import { baseEffect } from "./baseEffect";
import { valueKeyframed } from "../properties/valueKeyframed";

export class angle extends baseEffect {
  /**
   * Value. Effect value
   */
  v: valueKeyframed;
}
