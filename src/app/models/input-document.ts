export enum InputDocumentType {
  SVG,
  JSON,
}

export class InputDocument {
  data: string;
  parsedData: any;
  rootNode: SVGSVGElement;
  title = "";
  type: InputDocumentType = InputDocumentType.SVG;
}
