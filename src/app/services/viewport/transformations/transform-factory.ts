import { Injectable } from "@angular/core";
import { RectTransform } from "./rect-transform";
import { CircleTransform } from "./circle-transform";
import { MatrixTransform } from "./matrix-transform";

/**
 * Each element can be transformed in a different way: x,y, cx,cy and etc.
 * Some of the transformations might be optimized.
 */
@Injectable({
  providedIn: "root"
})
export class TransformFactory {
  getTransformForElement(element: SVGGraphicsElement):MatrixTransform {
    if (!element) {
      return null;
    }

    if (element.nodeName === "rect" || element.nodeName === "text") {
      return new RectTransform(element);
    } else if (element.nodeName === "circle" || element.nodeName === "ellipse") {
      return new CircleTransform(element);
    }

    return new MatrixTransform(element);
  }
}
