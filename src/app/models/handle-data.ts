import { AdornerContainer } from "../services/viewport/adorners/adorner";
import {
  AdornerPointType,
  AdornerType,
} from "../services/viewport/adorners/adorner-type";
import { PathDataHandle } from "./path-data-handle";
/**
 * Handle tuple
 */
export class HandleData {
  adorner: AdornerContainer;
  /**
   * Binary selected list of the control points.
   */
  handle: AdornerPointType;
  /**
   * Selected path handle data.
   */
  pathDataHandles: PathDataHandle[];

  get type(): AdornerType {
    if (this.pathDataHandles) {
      return AdornerType.PathDataSelection;
    } else if (this.adorner) {
      return this.adorner.type;
    } else {
      return AdornerType.ElementsBounds;
    }
  }
}
