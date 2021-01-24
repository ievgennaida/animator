import { PathData } from "./path/path-data";
import { PathDataCommand } from "./path/path-data-command";
import { TreeNode } from "./tree-node";
/**
 * Path data handle.
 */
export class PathDataHandle {
  constructor(
    public node: TreeNode,
    public command: PathDataCommand,
    public type: PathDataHandleType = PathDataHandleType.Point,
    /**
     * Intersection point
     */
    public point: DOMPoint | null = null
  ) {}

  get pathData(): PathData | null {
    return this.command?.pathData || null;
  }
  get commandIndex(): number {
    return this.command.index;
  }
  isHandle(
    node: TreeNode,
    command: PathDataCommand,
    type: PathDataHandleType
  ): boolean {
    return (
      this.node === node &&
      this.type === type &&
      (this.command === command ||
        (this.command &&
          command &&
          this.command.index === command.index &&
          command.index !== -1 &&
          command.type === this.command.type))
    );
  }
  equals(another: PathDataHandle): boolean {
    if (!another) {
      return false;
    }
    if (this.isHandle(another.node, another.command, another.type)) {
      if (!this.point && !another.point) {
        return true;
      } else {
        return this.point === another.point;
      }
    }
    return false;
  }
}
export enum PathDataHandleType {
  /**
   * Path data point.
   */
  Point,
  /**
   * Handle\Control point for a path data.
   */
  HandleA,
  /**
   * Handle\Control point for a path data.
   */
  HandleB,
  /**
   * Selected bezier curve or a line between two path data commands.
   */
  Curve,
}
