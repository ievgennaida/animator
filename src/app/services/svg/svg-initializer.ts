import { IInitializer, InitResults } from "../interfaces/intializer";
import { InputDocument } from "src/app/models/input-document";
import { SvgPlayer } from "./svg-player";

export class SvgInitializer implements IInitializer {
  constructor() {}
  initOnRefresh(): boolean {
    return false;
  }

  intialize(document: InputDocument, host: SVGElement): InitResults {
    const toSet = document.parsedData as XMLDocument;
    if (
      !toSet ||
      !toSet.documentElement ||
      toSet.documentElement.tagName !== "svg"
    ) {
      throw Error("SVG element is expected");
    }
    let currentHost = host as SVGSVGElement;
    if (!currentHost) {
      currentHost = host.ownerSVGElement;
    }

    let root: any = toSet.documentElement;
    root = root as SVGSVGElement;
    const rect = root.getBBox();

    const svgcontent = host.ownerDocument.adoptNode<SVGSVGElement>(
      root as SVGSVGElement
    );

    host.innerHTML = "";
    host.append(svgcontent);
    document.parsedData = svgcontent;
    const results = new InitResults();
    results.player = new SvgPlayer(svgcontent);
    results.size = svgcontent.getBBox();
    return results;
  }
}
