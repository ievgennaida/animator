import { InputDocument, InputDocumentType } from "../models/input-document";
import { SvgTreeParser } from "./svg/svg-tree.parser";
import { IParser } from "../models/interfaces/parser";
import { SvgInitializer } from "./svg/svg-initializer";
import { Injectable } from "@angular/core";
import { IInitializer } from "../models/interfaces/initializer";

@Injectable({
  providedIn: "root",
})
export class AppFactory {
  // TODO: inject on demand.
  constructor() {}

  getParser(document: InputDocument): IParser {
    if (document.type === InputDocumentType.JSON) {
      return null;
    } else {
      return new SvgTreeParser();
    }
  }

  /**
   * Viewport initializer.
   */
  getViewportInitializer(document: InputDocument): IInitializer {
    if (document.type === InputDocumentType.JSON) {
      return null;
    } else {
      return new SvgInitializer();
    }
  }
}
