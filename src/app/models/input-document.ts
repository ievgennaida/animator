import { InputDocumentType } from "./input-document-type";
import { IParser } from "./interfaces/parser";
import { TreeNode } from "./tree-node";

export class InputDocument {
  data: string | null = null;
  parsedData: any | null = null;
  rootNode: TreeNode | null = null;
  parser: IParser | null = null;
  get rootElement(): SVGSVGElement {
    return this.rootNode.getElement() as SVGSVGElement;
  }
  title = "";
  type: InputDocumentType = InputDocumentType.svg;
}
