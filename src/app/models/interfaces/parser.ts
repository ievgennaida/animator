import { InputDocument } from "src/app/models/input-document";
import { TreeNode } from "src/app/models/tree-node";

export interface IParser {
  parse(document: InputDocument): TreeNode[];
  /**
   * Convert element to tree node.
   * @param el element to be converted.
   */
  convertTreeNode(el: any): TreeNode;
  buildFlat(item: TreeNode, collection?: TreeNode[]): TreeNode[];
  isContainer(node: TreeNode): boolean;
}
