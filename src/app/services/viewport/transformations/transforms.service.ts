import { Injectable } from "@angular/core";
import { RectTransform } from "./rect-transform";
import { CircleTransform } from "./circle-transform";
import { MatrixTransform, TransformationMode } from "./matrix-transform";
import { Subject } from "rxjs";
import { EllipseTransform } from "./ellipse-transform";
import { TextTransform } from "./text-transform";
import { PathTransform } from "./path-transform";
import { TreeNode } from "src/app/models/tree-node";
import { HandleData } from "src/app/models/handle-data";
import { AdornerTypeUtils } from "../adorners/adorner-type";

/**
 * Hold transformation transactions.
 * Each element can be transformed in a different way: x,y, cx,cy and etc.
 */
@Injectable({
  providedIn: "root",
})
export class TransformsService {
  // TransformedData
  transformedSubject = new Subject();
  transactions: Array<MatrixTransform> = null;
  changed = false;
  public get transformed() {
    return this.transformedSubject.asObservable();
  }

  emitTransformed(element: SVGElement) {
    this.transformedSubject.next(element);
  }
  getTransform(node: TreeNode): MatrixTransform {
    if (!node) {
      return null;
    }

    const nodeName = node.nodeName;
    if (nodeName === "rect") {
      return new RectTransform(node);
    } else if (
      nodeName === "text" ||
      nodeName === "textPath" ||
      nodeName === "tspan"
    ) {
      return new TextTransform(node);
    } else if (nodeName === "path") {
      return new PathTransform(node);
    } else if (nodeName === "circle") {
      return new CircleTransform(node);
    } else if (nodeName === "ellipse") {
      return new EllipseTransform(node);
    }
    return new MatrixTransform(node);
  }

  /**
   * Is transformation transaction running
   */
  isActive() {
    return this.transactions !== null && this.transactions.length > 0;
  }
  isChanged() {
    return this.changed;
  }
  commit() {
    this.changed = false;
  }
  cancel() {
    this.changed = false;
    this.transactions = null;
  }

  transformByMouse(screenPos: DOMPoint): boolean {
    if (!this.transactions) {
      return false;
    }
    let changed = false;
    this.transactions.forEach((p) => {
      changed = p.transformByMouse(screenPos) || changed;
    });

    if (changed) {
      this.changed = this.changed || changed;
      this.emitTransformed(null);
    }
    return changed;
  }

  start(transformations: MatrixTransform[]) {
    this.transactions = transformations;
    this.changed = false;
  }
  prepareTransactions(
    nodes: TreeNode[],
    screenPoint: DOMPoint,
    handle: HandleData
  ): MatrixTransform[] | null {
    if (!nodes || nodes.length === 0) {
      return null;
    }
    const transformations = nodes
      .map((p) => {
        let transformation: MatrixTransform = null;
        if (handle) {
          if (AdornerTypeUtils.isRotateAdornerType(handle.handles)) {
            if (p.allowRotate) {
              transformation = this.getTransform(p);
              transformation.handle = handle;
              transformation.beginMouseRotateTransaction(screenPoint);
            }
          } else {
            if (p.allowResize) {
              transformation = this.getTransform(p);
              transformation.beginHandleTransformation(screenPoint, handle);
            }
          }
        } else {
          transformation = this.getTransform(p);
          transformation.beginMouseTransaction(screenPoint);
        }
        return transformation;
      })
      .filter((p) => !!p);

    transformations.forEach((p) => {
      if (p.mode === TransformationMode.Translate) {
        p.moveByMouse(screenPoint);
      }
    });

    return transformations;
  }
}
