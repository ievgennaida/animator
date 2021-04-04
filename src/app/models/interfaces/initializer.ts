import { InputDocument } from "src/app/models/input-document";
import { IPlayer } from "./player";

export interface IInitializer {
  initialize(document: InputDocument, viewport: SVGElement): InitResults;
  initOnRefresh(): boolean;
}

export interface InitResults {
  player: IPlayer;
  size: DOMRect;
}
