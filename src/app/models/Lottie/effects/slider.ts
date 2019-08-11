import { baseEffect } from "./baseEffect";
import { valueKeyframed } from "../properties/valueKeyframed";

export class slider extends baseEffect {
  /**
   * Value. Effect value
   */
  v?: valueKeyframed;
}
