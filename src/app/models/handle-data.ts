import { AdornerType } from "../services/viewport/adorners/adorner-type";
import { TreeNode } from "./tree-node";
import { AdornerData } from "../services/viewport/adorners/adorner-data";
/**
 * Handle tuple
 */
export class HandleData {
  node: TreeNode;
  adornerData: AdornerData;
  handles: AdornerType;
  nodes: Array<TreeNode>;
  rotate = false;
}
