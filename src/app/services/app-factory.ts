import { InputDocument, InputDocumentType } from "../models/input-document";
import { LottieTreeParser } from "./lottie/lottie-tree.parser";
import { SvgTreeParser } from "./svg/svg-tree.parser";
import { IParser } from "./interfaces/parser";
import { LottieInitializer } from "./lottie/lottie-intializer";
import { IInitializer } from "./interfaces/intializer";
import { SvgInitializer } from "./svg/svg-initializer";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class AppFactory {
  // TODO: inject on demand.
  constructor(
    private lottieTreeParser: LottieTreeParser
  ) {}

  getParser(document: InputDocument): IParser {
    if (document.type === InputDocumentType.JSON) {
      return this.lottieTreeParser;
    } else {
      return new SvgTreeParser();
    }
  }

  /**
   * Viewport initializer.
   */
  getViewportIntializer(document: InputDocument): IInitializer {
    if (document.type === InputDocumentType.JSON) {
      return new LottieInitializer();
    } else {
      return new SvgInitializer();
    }
  }
}
