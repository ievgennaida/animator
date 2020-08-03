import { TreeNode } from "./tree-node";
/**
 * Path data handle.
 */
export class PathDataHandle {
  node: TreeNode;
  commandIndex: number;
  commandType: PathDataHandleType = PathDataHandleType.Point;
}
export enum PathDataHandleType {
  Point,
  HandleA,
  HandleB,
}
