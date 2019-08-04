import { baseLayer } from "./baseLayer";
import { valueKeyframed } from "../properties/valueKeyframed";

export class preComp extends baseLayer {
  /**
   * Reference ID. id pointing to the source composition defined on 'assets' object.
   */
  refId?: string;

  /**
   * Time Remapping. Comp's Time remapping
   */
  tm?: valueKeyframed;
}
