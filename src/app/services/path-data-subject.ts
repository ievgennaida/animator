import { PathDataHandle, PathDataHandleType } from "../models/path-data-handle";
import { PathDataCommand } from "../models/path/path-data-command";
import { TreeNode } from "../models/tree-node";
import { ChangeStateMode, StateSubject } from "./state-subject";
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
    return this.getHandle(handle.node, handle.command, handle.type);
  }

  getHandle(
    node: TreeNode,
    command: PathDataCommand,
    type: PathDataHandleType = PathDataHandleType.Point
  ): PathDataHandle {
    const array = this.getValues();
    return array.find((p) => p.isHandle(node, command, type));
  }
  getHandlesByType(pathHandleType: PathDataHandleType): Array<PathDataHandle> {
    const array = this.getValues();
    return array.filter((p) => p.type === pathHandleType);
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
    if (!nodes || nodes.length === 0) {
      return false;
    }
    const toLeave = this.getValues().find((p) =>
      nodes.find((node) => node === p.node)
    );
    return this.change(toLeave, ChangeStateMode.Remove);
  }
}
