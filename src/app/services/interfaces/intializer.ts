import { InputDocument } from 'src/app/models/input-document';

export interface IInitializer {
  intialize(document: InputDocument, viewport: SVGElement): any;
  initOnRefresh():boolean;
}
