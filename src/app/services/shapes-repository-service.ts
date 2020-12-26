import { Injectable } from "@angular/core";

const xmlns = "http://www.w3.org/2000/svg";
@Injectable({
  providedIn: "root",
})
export class ShapesRepositoryService {
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
