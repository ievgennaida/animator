import { IInitializer, InitResults } from "../../models/interfaces/initializer";
import { InputDocument } from "src/app/models/input-document";
import { SvgPlayer } from "./svg-player";
const xmlns = "http://www.w3.org/2000/svg";
export class SvgInitializer implements IInitializer {
  constructor() {}
  initOnRefresh(): boolean {
    return false;
  }

  initialize(document: InputDocument, host: SVGElement): InitResults {
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

    const svgContent = host.ownerDocument.adoptNode<SVGSVGElement>(
      root as SVGSVGElement
    );

    host.innerHTML = "";
    host.append(svgContent);
    document.parsedData = svgContent;
    document.rootNode = svgContent;
    const results = new InitResults();
    results.player = new SvgPlayer(svgContent);
    const w = svgContent.width.baseVal;
    const h = svgContent.height.baseVal;
    if (
      !w.valueAsString ||
      !h.valueAsString ||
      w.unitType === w.SVG_LENGTHTYPE_PERCENTAGE ||
      h.unitType === h.SVG_LENGTHTYPE_PERCENTAGE
    ) {
      results.size = svgContent.getBBox();
    } else {
      results.size = new DOMRect(
        svgContent.x.baseVal.value,
        svgContent.y.baseVal.value,
        w.value,
        h.value
      );
    }

    return results;
  }

  createPath(): SVGPathElement {
    const el: any = document.createElementNS(xmlns, "path");
    return el;
  }
}
