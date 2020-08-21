import { Adorner } from "../services/viewport/adorners/adorner";
import { AdornerType } from "../services/viewport/adorners/adorner-type";
/**
 * Handle tuple
 */
export class HandleData {
  adorner: Adorner;
  /**
   * Binary selected list of the control points.
   */
  handles: AdornerType;
  rotate = false;
}
