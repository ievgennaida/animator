import { TreeNode } from "./tree-node";
/**
 * Path data handle.
 */
export class PathDataHandle {
  constructor(
    private node: TreeNode,
    private commandIndex: number,
    private commandType: PathDataHandleType = PathDataHandleType.Point
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
  Point = 0,
  HandleA = 1,
  HandleB = 2,
  Curve = 3,
}
