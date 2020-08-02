import { Injectable } from "@angular/core";
import { consts } from "src/environments/consts";
import {
  AdornerTypeUtils,
  AdornerType,
} from "./viewport/adorners/adorner-type";
import { Utils } from "./utils/utils";
import { HandleData } from "../models/handle-data";
import { TreeNode } from "../models/tree-node";
import { ViewService } from "./view.service";
import { OutlineService } from "./outline.service";
import { LoggerService } from "./logger.service";
@Injectable({
  providedIn: "root",
})
export class IntersectionService {
  constructor(
    private viewService: ViewService,
    private outlineService: OutlineService,
    private logger: LoggerService
  ) {}

  getIntersects(
    selector: DOMRect | DOMPoint,
    onlyFirst: boolean = false
  ): TreeNode[] | TreeNode {
    const matrix = this.viewService.getCTM();
    const transformed = Utils.matrixRectTransform(selector as DOMRect, matrix);

    let selected: TreeNode[] = null;
    const nodes = this.outlineService.getAllNodes();

    if (nodes && nodes.length > 0) {
      const containerRect = this.viewService.getContainerClientRect();

      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        if (node) {
          try {
            const bounds = node.getBoundingClientRect();
            if (!bounds) {
              continue;
            }

            bounds.x -= containerRect.left;
            bounds.y -= containerRect.top;

            if (Utils.rectsIntersect(bounds, transformed)) {
              if (onlyFirst) {
                return node;
              }
              if (!selected) {
                selected = [];
              }
              selected.push(node);
            }
          } catch (err) {
            this.logger.warn(`Cannot check intersection ${err}`);
          }
        }
      }
    }
    return selected;
  }

  getAdornerHandleIntersection(
    screenPoint: DOMPoint,
    nodes: TreeNode[]
  ): HandleData | null {
    if (!nodes) {
      return;
    }
    let results: HandleData = null;
    const toReturn = nodes.find((node) => {
      if (!node.allowResize) {
        return false;
      }
      const adorner = node.getElementAdorner();
      const elPoint = Utils.toElementPoint(node, screenPoint);
      if (!elPoint) {
        return false;
      }
      const screenPointSize = Utils.getLength(
        Utils.toElementPoint(
          node,
          new DOMPoint(screenPoint.x + 1, screenPoint.y + 1)
        ),
        elPoint
      );

      const accuracy = screenPointSize * consts.handleSize;
      const intersects = adorner.intersectAdorner(adorner, elPoint, accuracy);
      if (intersects !== AdornerType.None) {
        if (!results) {
          results = new HandleData();
        }
        results.rotate = AdornerTypeUtils.isRotateAdornerType(intersects);
        results.handles = intersects;
        return true;
      }
    });
    if (!toReturn) {
      return null;
    }
    results.node = toReturn;
    results.adornerData = toReturn.getElementAdorner();
    return results;
  }
}
