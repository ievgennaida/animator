import { Adorner } from "../services/viewport/adorners/adorner";
import { AdornerType } from "../services/viewport/adorners/adorner-type";
import { PathDataHandle } from "./path-data-handle";
/**
 * Handle tuple
 */
export class HandleData {
  adorner: Adorner;
  /**
   * Binary selected list of the control points.
   */
  handles: AdornerType;
  /**
   * Selected path handle data.
   */
  pathDataHandles: PathDataHandle[];
  rotate = false;
}
