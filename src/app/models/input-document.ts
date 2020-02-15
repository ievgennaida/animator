export enum InputDocumentType {
  SVG,
  JSON
}

export class InputDocument {
  data: string;
  parsedData: any;
  title = '';
  type: InputDocumentType = InputDocumentType.SVG;
}
