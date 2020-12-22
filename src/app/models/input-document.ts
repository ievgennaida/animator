import { IParser } from "./interfaces/parser";
import { TreeNode } from "./tree-node";

export enum InputDocumentType {
  SVG,
  JSON,
}

export class InputDocument {
  data: string;
  parsedData: any;
  rootNode: TreeNode;
  parser: IParser;
  get rootElement(): SVGSVGElement {
    return this.rootNode.getElement() as SVGSVGElement;
  }
  title = "";
  type: InputDocumentType = InputDocumentType.SVG;
}
