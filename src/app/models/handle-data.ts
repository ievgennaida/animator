import { AdornerType } from "../models/adorner-type";
import { AdornerContainer } from "./adorner";
import { AdornerPointType } from "./adorner-point-type";
import { PathDataHandle } from "./path-data-handle";
import { TreeNode } from "./tree-node";
/**
 * Handle tuple
 */
export class HandleData {
  adorner: AdornerContainer | null = null;
  /**
   * Binary selected list of the control points.
   */
  handle: AdornerPointType = AdornerPointType.none;
  /**
   * Selected path handle data.
   */
  pathDataHandles: PathDataHandle[] = [];

  getHandlesByNode(node: TreeNode | null): PathDataHandle[] | null {
    return this.pathDataHandles?.filter((p) => p.node === node) || null;
  }
  get type(): AdornerType {
    if (this.pathDataHandles) {
      return AdornerType.pathDataSelection;
    } else if (this.adorner) {
      return this.adorner.type;
    } else {
      return AdornerType.elementsBounds;
    }
  }
}
