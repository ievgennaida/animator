import { Injectable } from "@angular/core";
import { RectTransform } from "./rect-transform";
import { CircleTransform } from "./circle-transform";
import { MatrixTransform } from "./matrix-transform";
import { Subject } from "rxjs";
import { EllipseTransform } from "./ellipse-transform";

/**
 * Each element can be transformed in a different way: x,y, cx,cy and etc.
 * Some of the transformations might be optimized.
 */
@Injectable({
  providedIn: "root",
})
export class TransformsService {
  // TransformedData
  transformedSubject = new Subject();
  public get transformed() {
    return this.transformedSubject.asObservable();
  }

  emitTransformed(element: SVGElement) {
    this.transformedSubject.next(element);
  }
  getTransformForElement(element: SVGGraphicsElement): MatrixTransform {
    if (!element) {
      return null;
    }

    if (element.nodeName === "rect" || element.nodeName === "text") {
      return new RectTransform(element, this);
    } else if (element.nodeName === "circle") {
      return new CircleTransform(element, this);
    } else if (element.nodeName === "ellipse") {
      return new EllipseTransform(element, this);
    }
    return new MatrixTransform(element, this);
  }
}
