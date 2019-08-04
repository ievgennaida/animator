import { valueKeyframed } from "../properties/valueKeyframed";
import { value } from "../properties/value";
import { baseShape } from "./baseShape";

export class round extends baseShape {
  /**
   * Radius. Rounded Corner Radius
   */
  r: value | valueKeyframed;
}
