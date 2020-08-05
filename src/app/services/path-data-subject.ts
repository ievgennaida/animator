import { PathDataHandle, PathDataHandleType } from "../models/path-data-handle";
import { StateSubject, ChangeStateMode } from "./state-subject";
import { TreeNode } from "../models/tree-node";

/**
 * Subject to track selected/mouse over path data handles.
 */
export class PathDataSelectionSubject extends StateSubject<PathDataHandle> {
  /**
   * Override.
   * Check path data on equality comparison
   */
  protected equals(first: PathDataHandle, second: PathDataHandle) {
    if (!first && !second) {
      return false;
    }
    if (!first || !second) {
      return false;
    }
    return first.equals(second);
  }

  getHandle(
    node: TreeNode,
    commandIndex: number,
    commandType: PathDataHandleType = PathDataHandleType.Point
  ): PathDataHandle {
    const array = this.getValues();
    return array.find((p) => p.isHandle(node, commandIndex, commandType));
  }
  getHandles(nodeFilter: TreeNode = null): Array<PathDataHandle> {
    const array = this.getValues();
    if (nodeFilter) {
      return array.filter((p) => p.node === nodeFilter);
    }
    return array || [];
  }

  /**
   * Deselect tree nodes
   */
  leaveNodes(nodes: TreeNode[]): boolean {
    if (!nodes) {
      return false;
    }
    const toLeave = this.getValues().find((p) =>
      nodes.find((node) => node === p.node)
    );
    return this.change(toLeave, ChangeStateMode.Remove);
  }
}
