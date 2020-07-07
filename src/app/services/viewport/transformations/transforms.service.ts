import { Injectable } from "@angular/core";
import { RectTransform } from "./rect-transform";
import { CircleTransform } from "./circle-transform";
import { MatrixTransform } from "./matrix-transform";
import { Subject } from "rxjs";
import { EllipseTransform } from "./ellipse-transform";
import { TextTransform } from "./text-transform";
import { PathTransform } from "./path-transform";
import { TreeNode } from 'src/app/models/tree-node';

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
  getTransformForElement(node: TreeNode): MatrixTransform {
    if (!node) {
      return null;
    }

    const nodeName = node.nodeName;
    if (nodeName === "rect") {
      return new RectTransform(node, this);
    } else if (
      nodeName === "text" ||
      nodeName === "textPath" ||
      nodeName === "tspan"
    ) {
      return new TextTransform(node, this);
    } else if (nodeName === "path") {
      return new PathTransform(node, this);
    } else if (nodeName === "circle") {
      return new CircleTransform(node, this);
    } else if (nodeName === "ellipse") {
      return new EllipseTransform(node, this);
    }
    return new MatrixTransform(node, this);
  }
}
