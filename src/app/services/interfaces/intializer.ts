import { InputDocument } from 'src/app/models/input-document';
import { IPlayer } from './player';

export interface IInitializer {
  intialize(document: InputDocument, viewport: SVGElement): InitResults;
  initOnRefresh():boolean;
}

export class InitResults{
  player: IPlayer;
  size: DOMRect;
}