import { TreeNode } from "src/app/models/tree-node";

export enum TransformedType {
  Viewport,
  Element,
  Selector,
}

export class TransformedData {
  node: TreeNode;
  element: SVGGraphicsElement = null;
  type = TransformedType.Element;
}
