const xmlns = "http://www.w3.org/2000/svg";
export class SvgShapes {
  constructor() {}
  createPath(): SVGPathElement {
    const el: any = document.createElementNS(xmlns, "path");
    return el;
  }
  createRect(): SVGRectElement {
    const el: any = document.createElementNS(xmlns, "rect");
    return el;
  }
}
