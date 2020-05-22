import { AdornerType } from "../services/viewport/adorners/adorner-type";
import { TreeNode } from "./tree-node";
/**
 * Handle tuple
 */
export class HandleData {
  node: TreeNode;
  handles: AdornerType;
  nodes: Array<TreeNode>;
  rotate = false;
}
