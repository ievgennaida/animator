import { PathDataHandle, PathDataHandleType } from "../models/path-data-handle";
import { TreeNode } from "../models/tree-node";
import { ChangeStateMode, StateSubject } from "./state-subject";
import { AdornerData } from "./viewport/adorners/adorner-data";
/**
 * Subject to track selected/mouse over path data handles.
 */
export class PathDataSelectionSubject extends StateSubject<PathDataHandle> {
  bounds: AdornerData | null;
  calculateHandlesBounds() {
    const points = (this.getValues() || []).filter(
      (p) => p.commandType === PathDataHandleType.Point
    );
    if (points.length <= 1) {
      this.bounds = null;
    } else {
      let minX = Number.MAX_VALUE;
      let maxX = Number.MIN_VALUE;
      let minY = Number.MAX_VALUE;
      let maxY = Number.MIN_VALUE;

      points.forEach((handle, index) => {
        const p = handle?.node?.getPathData()?.commands[index]?.getAbsolute()
          ?.p;
        if (!p) {
          return;
        }
        minX = Math.min(p.x, minX);
        maxX = Math.max(p.x, maxX);

        minY = Math.min(p.y, minY);
        maxY = Math.max(p.y, maxY);
      });
      this.bounds = new AdornerData();
      this.bounds.decomposeRect(
        new DOMRect(
          minX,
          minY,
          Math.max(maxX - minX, 1),
          Math.max(maxY - minY, 1)
        )
      );
    }
  }
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
