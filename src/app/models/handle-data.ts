import { AdornerContainer } from "../services/viewport/adorners/adorner";
import {
  AdornerPointType,
  AdornerType,
} from "../services/viewport/adorners/adorner-type";
import { PathDataHandle } from "./path-data-handle";
import { TreeNode } from "./tree-node";
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

  getHandlesByNode(node: TreeNode | null): PathDataHandle[] | null {
    return this.pathDataHandles?.filter((p) => p.node === node) || null;
  }
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
