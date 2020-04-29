import { InputDocument } from "src/app/models/input-document";
import { TreeNode } from "src/app/models/tree-node";

export interface IParser {
  parse(document: InputDocument): TreeNode[];
}
