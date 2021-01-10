import { PathData } from "./path/path-data";
import { PathDataCommand } from "./path/path-data-command";
import { TreeNode } from "./tree-node";
/**
 * Path data handle.
 */
export class PathDataHandle {
  constructor(
    public node: TreeNode,
    public pathData: PathData,
    public command: PathDataCommand,
    public commandIndex: number,
    public commandType: PathDataHandleType = PathDataHandleType.Point,
    /**
     * Intersection point
     */
    public point: DOMPoint | null = null
  ) {}

  isHandle(
    node: TreeNode,
    commandIndex: number,
    commandType: PathDataHandleType
  ): boolean {
    return (
      this.node === node &&
      this.commandIndex === commandIndex &&
      this.commandType === commandType
    );
  }
  equals(another: PathDataHandle): boolean {
    if (!another) {
      return false;
    }
    if (
      this.isHandle(another.node, another.commandIndex, another.commandType)
    ) {
      return (this.point || another.point) && this.point === another.point;
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
   * Not existing point to be added on a curve.
   */
  AddPoint,
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
