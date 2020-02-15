import { IInitializer } from "../interfaces/intializer";
import { InputDocument } from "src/app/models/input-document";

export class SvgInitializer implements IInitializer {
  initOnRefresh(): boolean {
    return false;
  }

  intialize(document: InputDocument, viewport: SVGElement) {
    viewport.appendChild(document.parsedData);
  }
}
