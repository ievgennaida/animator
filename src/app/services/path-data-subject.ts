import { PathDataHandle, PathDataHandleType } from "../models/path-data-handle";
import { TreeNode } from "../models/tree-node";
import { ChangeStateMode, StateSubject } from "./state-subject";
import { ThrowStmt } from "@angular/compiler";

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

  findByHandle(handle: PathDataHandle) {
    if (!handle) {
      return null;
    }
    return this.getHandle(handle.node, handle.commandIndex, handle.commandType);
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