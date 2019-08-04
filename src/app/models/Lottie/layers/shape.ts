import { baseLayer } from "./baseLayer";
import { anyShape } from '../shapes/shapeType';

export class shape extends baseLayer {
  /**
   * Items Shape list of items
   */
  shapes?: anyShape[];
}
