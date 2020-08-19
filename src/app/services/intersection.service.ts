import { Injectable } from "@angular/core";
import { consts } from "src/environments/consts";
import { environment } from "src/environments/environment";
import { HandleData } from "../models/handle-data";
import { PathDataHandle, PathDataHandleType } from "../models/path-data-handle";
import { PathDataCommand } from "../models/path/path-data-command";
import { PathType } from "../models/path/path-type";
import { TreeNode } from "../models/tree-node";
import { LoggerService } from "./logger.service";
import { OutlineService } from "./outline.service";
import { SelectionService } from "./selection.service";
import { Utils } from "./utils/utils";
import { ViewService } from "./view.service";
import { AdornerData } from "./viewport/adorners/adorner-data";
import {
  AdornerType,
  AdornerTypeUtils,
} from "./viewport/adorners/adorner-type";

export interface NearestCommandPoint {
  point: DOMPoint;
  command: PathDataCommand;
  commandIndex: number;
  node: TreeNode;
  distance: number;
  /**
   * Returned only in debug mode.
   */
  allPoints: DOMPoint[];
}
@Injectable({
  providedIn: "root",
})
export class IntersectionService {
  constructor(
    private viewService: ViewService,
    private outlineService: OutlineService,
    private logger: LoggerService,
    private selectionService: SelectionService
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
      const intersects = this.intersectAdorner(adorner, elPoint, accuracy);
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
      let prevBestDistance = Number.MAX_VALUE;
      nodes.forEach((node) => {
        const data = node.getPathData();
        const p = Utils.toElementPoint(node, screenPos);
        const rectSelector = this.selectionRectToNodeCoordinates(
          selectorRect,
          node
        );
        if (data && data.commands) {
          data.forEach((command, commandIndex) => {
            const abs = command;
            if (abs.type === PathType.closeAbs) {
              return;
            }
            let pointSelected = false;
            if (rectSelector) {
              pointSelected =
                pointSelected || Utils.rectIntersectPoint(rectSelector, abs.p);
            }
            let handleType = PathDataHandleType.Point;
            if (p && !rectSelector) {
              // TODO: select a,b helper handles.
              const screenPointSize = Utils.getLength(
                Utils.toElementPoint(
                  node,
                  new DOMPoint(screenPos.x + 1, screenPos.y + 1)
                ),
                p
              );

              let accuracy = screenPointSize * consts.pathPointSize;
              let l = Utils.getLength(p, abs.p);
              if (l <= accuracy && prevBestDistance > l) {
                prevBestDistance = l;
                pointSelected = true;
              }
              const handlesActivated = this.selectionService.isPathHandlesActivated(
                node,
                commandIndex
              );
              if (handlesActivated) {
                accuracy = screenPointSize * consts.pathHandleSelectedSize;
                const a = abs.a;
                if (a) {
                  l = Utils.getLength(p, a);
                  if (l <= accuracy && prevBestDistance > l) {
                    handleType = PathDataHandleType.HandleA;
                    prevBestDistance = l;
                    pointSelected = true;
                  }
                }
                const b = abs.b;
                if (b) {
                  l = Utils.getLength(p, b);
                  if (l <= accuracy && prevBestDistance > l) {
                    handleType = PathDataHandleType.HandleB;
                    prevBestDistance = l;
                    pointSelected = true;
                  }
                }
              }
            }

            if (pointSelected) {
              // Return only one when selected by screen point.
              if (!rectSelector) {
                // Cleanup but keep array reference.
                mouseOverItems.length = 0;
              }

              mouseOverItems.push(
                new PathDataHandle(node, commandIndex, handleType)
              );
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

  getMouseOverPathCurve(
    nodes: TreeNode[],
    screenPoint: DOMPoint
  ): NearestCommandPoint | null {
    if (!nodes || !screenPoint) {
      return null;
    }
    let nearest: NearestCommandPoint = null;

    nodes.forEach((node) => {
      const elementPoint = Utils.toElementPoint(node, screenPoint);
      let zoom = this.viewService.getZoom();
      if (zoom === 0) {
        zoom = 0.01;
      }
      // Convert stroke with with screen zoom level, so properly calculated when zoomed.
      const strokeThickness = Math.max(node.strokeWidth(), 2);
      const nextNearest = this.getNearestPathPoint(
        node,
        elementPoint,
        strokeThickness
      );
      if (nextNearest && nextNearest.distance <= strokeThickness) {
        if (!nearest) {
          nearest = nextNearest;
        } else if (nearest) {
          if (nearest.distance > nextNearest.distance) {
            nearest = nextNearest;
          }
        }
      }
    });

    return nearest;
  }
  /**
   * Get nearest path point with a nearest used command.
   * Optimized to get only for the mouse over.
   * Custom getPointOnPath and path length implementation
   * is used in order to determine closest path command.
   *
   * For the generic DOM implementation of a getPointOnPath see Mike Bostock's example:
   * https://bl.ocks.org/mbostock/8027637
   */
  getNearestPathPoint(
    node: TreeNode,
    elementPoint: DOMPoint,
    shrinkBounds: number = 0,
    accuracy: number = 0.01,
    lengthLimit: number | null = null
  ): NearestCommandPoint | null {
    if (!node) {
      return null;
    }

    const nodeBounds = node.getBBox();
    if (!Utils.rectIntersectPoint(nodeBounds, elementPoint)) {
      return null;
    }

    const pathData = node.getPathData();
    if (!pathData) {
      return null;
    }
    let nearest: NearestCommandPoint = null;
    const expectedLen = 8;
    let usedStep = 0;
    let bestPositionOnFragment = 0;
    // Linear search, find nearest command first.
    pathData.forEach((command, index) => {
      const totalLength = command.length;
      if (totalLength > accuracy) {
        let step = Math.floor(totalLength / expectedLen);
        if (step < 1) {
          step = 1;
        }
        // Optimization: exclude commands that are completely out of the bounds.
        let bounds = command.getBounds();
        if (bounds && elementPoint) {
          if (shrinkBounds) {
            bounds = Utils.shrinkRect(bounds, shrinkBounds, shrinkBounds);
          }
          if (!Utils.rectIntersectPoint(bounds, elementPoint)) {
            return;
          }
        }
        step = totalLength / step;
        const isFirst = !command.prev;
        // small offset is used to choose the best command
        // when prev and next points are overlapped.
        const startWith = isFirst ? 0 : 0.01;
        for (let i = startWith; i <= totalLength; i += step) {
          const pLen = command.getPointOnPath(i);
          if (pLen) {
            const length = Utils.getLength(elementPoint, pLen);
            if (!lengthLimit || lengthLimit >= length) {
              if (!nearest) {
                nearest = { distance: Number.MAX_VALUE } as NearestCommandPoint;
              }

              if (nearest.distance > length) {
                nearest.command = command;
                nearest.point = pLen;
                nearest.node = node;
                nearest.distance = length;
                nearest.commandIndex = index;
                bestPositionOnFragment = i;
                usedStep = step;
                if (environment.debug && !nearest.allPoints) {
                  nearest.allPoints = [];
                }
              }
            }
            if (nearest && nearest.allPoints) {
              nearest.allPoints.push(pLen);
            }
          }
          // Fix JavaScript non-accurate comparison. Ensure last point of a command is included.
          if (
            Math.round(i * 100) !== Math.round(totalLength * 100) &&
            i + step > totalLength
          ) {
            i = totalLength - step;
          }
        }
      }
    });

    // Increase accuracy for the found command.
    if (nearest) {
      usedStep = usedStep / 2;
      const abs = nearest.command;
      const totalLength = abs.length;
      const setNearestWhenBetter = (
        i: number,
        n: NearestCommandPoint,
        pathCommand: PathDataCommand
      ): boolean => {
        const nextPointFound = pathCommand.getPointOnPath(i);
        if (nextPointFound) {
          if (nearest.allPoints) {
            nearest.allPoints.push(nextPointFound);
          }
          const nextLength = Utils.getLength(nextPointFound, elementPoint);
          if (nearest.distance > nextLength) {
            n.distance = nextLength;
            n.point = nextPointFound;
            return true;
          }
        }

        return false;
      };

      const fallbackLimit = 10;
      let iteration = 0;
      while (usedStep > accuracy) {
        if (
          setNearestWhenBetter(
            Math.max(bestPositionOnFragment - usedStep, 0),
            nearest,
            abs
          )
        ) {
          bestPositionOnFragment -= usedStep;
          if (bestPositionOnFragment < 0) {
            usedStep /= 2;
          }
        } else {
          if (
            setNearestWhenBetter(
              Math.min(bestPositionOnFragment + usedStep, totalLength),
              nearest,
              abs
            )
          ) {
            bestPositionOnFragment += usedStep;
            if (bestPositionOnFragment > totalLength) {
              usedStep /= 2;
            }
          } else {
            usedStep /= 2;
          }
        }
        iteration++;
        if (iteration >= fallbackLimit) {
          break;
        }
      }
    }

    if (nearest && nearest.allPoints) {
      nearest.allPoints.push(nearest.point);
    }
    return nearest;
  }

  intersectAdorner(
    adorner: AdornerData,
    point: DOMPoint,
    accuracy = 6
  ): AdornerType {
    let toReturn = AdornerType.None;
    if (!point || !adorner) {
      return toReturn;
    }
    let minDistance = accuracy;
    const rotateArea = 1.5;

    // Find nearest point:
    adorner.points.forEach((adornerPoint, key) => {
      if (!adornerPoint) {
        return;
      }
      const v = Utils.getVector(adornerPoint, adorner.center, true);
      const rotateAccuracy = accuracy * rotateArea;
      const moveAdornerDistance = Utils.getLength(
        Utils.alongVector(adornerPoint, v, accuracy),
        point
      );
      let rotateDistance = Number.MAX_VALUE;
      if (adorner.allowToRotateAdorners(key)) {
        rotateDistance = Utils.getLength(
          Utils.alongVector(adornerPoint, v, rotateAccuracy),
          point
        );
      }
      if (
        rotateDistance <= minDistance * rotateArea ||
        moveAdornerDistance <= minDistance
      ) {
        // Move has a priority:
        if (rotateDistance + rotateDistance * 0.2 < moveAdornerDistance) {
          // Corresponding rotate key:
          toReturn = AdornerTypeUtils.toRotateAdornerType(key);
          minDistance = rotateDistance;
        } else {
          toReturn = key;
          minDistance = moveAdornerDistance;
        }
      }
    });

    return toReturn;
  }
}
