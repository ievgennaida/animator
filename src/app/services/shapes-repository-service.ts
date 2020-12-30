import { Injectable } from "@angular/core";

const xmlns = "http://www.w3.org/2000/svg";
@Injectable({
  providedIn: "root",
})
export class ShapesRepositoryService {
  constructor() {}
  createPath(): SVGPathElement {
    const el = document.createElementNS(xmlns, "path") as SVGPathElement;
    return el;
  }
  createRect(): SVGRectElement {
    const el = document.createElementNS(xmlns, "rect") as SVGRectElement;
    return el;
  }
}
