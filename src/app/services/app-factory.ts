import { Injectable } from "@angular/core";
import { InputDocumentType } from "../models/input-document-type";
import { IInitializer } from "../models/interfaces/initializer";
import { IParser } from "../models/interfaces/parser";
import { SvgInitializer } from "./svg/svg-initializer";
import { SvgTreeParser } from "./svg/svg-tree.parser";

@Injectable({
  providedIn: "root",
})
export class AppFactory {
  // TODO: inject on demand.
  constructor() {}

  getParser(type: InputDocumentType): IParser {
    if (type === InputDocumentType.json) {
      return null;
    } else {
      return new SvgTreeParser();
    }
  }

  /**
   * Viewport initializer.
   */
  getViewportInitializer(type: InputDocumentType): IInitializer {
    if (type === InputDocumentType.json) {
      return null;
    } else {
      return new SvgInitializer();
    }
  }
}
