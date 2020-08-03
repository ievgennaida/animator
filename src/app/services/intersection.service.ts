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
import { PathDataHandle } from "../models/path-data-handle";
@Injectable({
  providedIn: "root",
})
export class IntersectionService {
  constructor(
    private viewService: ViewService,
    private outlineService: OutlineService,
    private logger: LoggerService
  ) {}

  /**
   * get intersection by the viewport coordinates selector.
   */
  getIntersects(
    viewportSelector: DOMRect | DOMPoint,
    onlyFirst: boolean = false
  ): TreeNode[] | TreeNode {
    const matrix = this.viewService.getCTM();
    const transformed = Utils.matrixRectTransform(
      viewportSelector as DOMRect,
      matrix
    );

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

      // Get 1px length in element coordinates.
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
  intersectPathDataHandles(
    nodes: TreeNode[],
    selectorRect: DOMRect,
    screenPos: DOMPoint
  ): Array<PathDataHandle> {
    const mouseOverItems: Array<PathDataHandle> = [];

    if (nodes) {
      nodes.forEach((node) => {
        const data = node.getPathData();
        const p = Utils.toElementPoint(node, screenPos);
        const rectSelector = this.selectionRectToNodeCoordinates(
          selectorRect,
          node
        );
        if (p && data && data.commands) {
          data.commands.forEach((command, commandIndex) => {
            const abs = command.getAbsolute();
            let selected = false;
            if (rectSelector) {
              selected =
                selected || Utils.rectIntersectPoint(rectSelector, abs.p);
            }

            if (screenPos && !rectSelector) {
              const l = Utils.getLength(p, abs.p);
              // TODO: select a,b helper handles.
              const screenPointSize = Utils.getLength(
                Utils.toElementPoint(
                  node,
                  new DOMPoint(screenPos.x + 1, screenPos.y + 1)
                ),
                p
              );

              const accuracy = screenPointSize * consts.handleSize;
              selected = l <= accuracy;
            }

            if (selected) {
              mouseOverItems.push(new PathDataHandle(node, commandIndex));
            }
          });
        }
      });
    }
    return mouseOverItems;
  }
  selectionRectToNodeCoordinates(
    selectorRect: DOMRect,
    node: TreeNode
  ): DOMRect {
    if (!node) {
      return null;
    }
    const screenCTM = node.getScreenCTM();
    const viewportScreenCTM = this.viewService.getScreenCTM();
    if (!screenCTM || !viewportScreenCTM) {
      return;
    }
    const outputRect = Utils.matrixRectTransform(
      selectorRect,
      screenCTM.inverse().multiply(viewportScreenCTM)
    );

    return outputRect;
  }
}
