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
    public commandType: PathDataHandleType = PathDataHandleType.Point
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
    return this.isHandle(
      another.node,
      another.commandIndex,
      another.commandType
    );
  }
}
export enum PathDataHandleType {
  /**
   * Path data point.
   */
  Point = 0,
  /**
   * Handle\Control point for a path data.
   */
  HandleA = 1,
  /**
   * Handle\Control point for a path data.
   */
  HandleB = 2,
  /**
   * Selected bezier curve or a line between two path data commands.
   */
  Curve = 3,
}
