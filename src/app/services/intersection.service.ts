import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AdornerContainer } from "../models/adorner";
import { AdornerPointType, AdornerTypeUtils } from "../models/adorner-type";
import { HandleData } from "../models/handle-data";
import { PathDataHandle, PathDataHandleType } from "../models/path-data-handle";
import { PathData } from "../models/path/path-data";
import { PathDataCommand } from "../models/path/path-data-command";
import { PathType } from "../models/path/path-type";
import { TreeNode } from "../models/tree-node";
import { AdornersService } from "./adorners-service";
import { ConfigService } from "./config-service";
import { LoggerService } from "./logger.service";
import { OutlineService } from "./outline.service";
import { SelectionService } from "./selection.service";
import { Utils } from "./utils/utils";
import { ViewService } from "./view.service";

export interface NearestCommandPoint {
  point: DOMPoint;
  pathData: PathData;
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
    private configService: ConfigService,
    private selectionService: SelectionService,
    private adornersService: AdornersService
  ) {}

  /**
   * get intersection by the viewport coordinates selector.
   */
  getIntersects(screenRect: DOMRect, onlyFirst: boolean = false): TreeNode[] {
    if (!screenRect) {
      return null;
    }
    let selected: TreeNode[] = null;
    const nodes = this.outlineService.getAllNodes();

    if (nodes && nodes.length > 0) {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        if (node) {
          try {
            const bounds = node.getBoundingClientRect();
            if (!bounds) {
              continue;
            }

            if (Utils.rectsIntersect(bounds, screenRect)) {
              if (onlyFirst) {
                return [node];
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

  getAdornerHandleIntersection(screenPoint: DOMPoint): HandleData | null {
    let results: HandleData = null;
    const adorners = this.adornersService.getActiveAdorners();
    if (!adorners) {
      return null;
    }
    const toReturn = adorners.find((adorner) => {
      if (!adorner) {
        return false;
      }

      const intersects = this.intersectAdorner(adorner, adorners, screenPoint);
      if (intersects !== AdornerPointType.None) {
        if (!results) {
          results = new HandleData();
        }
        results.handle = intersects;
        return true;
      }
    });
    if (!toReturn) {
      return null;
    }
    results.adorner = toReturn;
    return results;
  }
  /**
   * get path data handles under the point or rectangle.
   * @param nodes list of nodes with path data.
   * @param selectorRect in screen coordinates.
   * @param screenPos in screen coordinates.
   */
  intersectPathDataHandles(
    nodes: TreeNode[],
    selectorRect: DOMRect,
    screenPos: DOMPoint
  ): Array<PathDataHandle> {
    const mouseOverItems: Array<PathDataHandle> = [];
    const config = this.configService.get();

    if (nodes) {
      let prevBestDistance = Number.MAX_VALUE;
      nodes.forEach((node) => {
        const data = node.getPathData();
        const p = Utils.toElementPoint(node, screenPos);
        if (data && data.commands) {
          data.forEach((command, commandIndex) => {
            const abs = command;
            if (abs.type === PathType.closeAbs) {
              return;
            }

            let pointSelected = false;
            if (selectorRect) {
              pointSelected = Utils.rectIntersectPoint(
                selectorRect,
                Utils.toScreenPoint(node, abs.p)
              );
            }
            let handleType = PathDataHandleType.Point;
            if (p && !selectorRect) {
              // TODO: select a,b helper handles.
              const screenPointSize = Utils.getDistance(
                Utils.toElementPoint(
                  node,
                  new DOMPoint(screenPos.x + 1, screenPos.y + 1)
                ),
                p
              );

              let accuracy = screenPointSize * config.pathPointSize;
              let l = Utils.getDistance(p, abs.p);
              if (l <= accuracy && prevBestDistance > l) {
                prevBestDistance = l;
                pointSelected = true;
              }
              const handlesActivated = this.selectionService.isPathHandlesActivated(
                node,
                commandIndex
              );
              if (handlesActivated) {
                accuracy = screenPointSize * config.pathHandleSelectedSize;
                const a = abs.a;
                if (a) {
                  l = Utils.getDistance(p, a);
                  if (l <= accuracy && prevBestDistance > l) {
                    handleType = PathDataHandleType.HandleA;
                    prevBestDistance = l;
                    pointSelected = true;
                  }
                }
                const b = abs.b;
                if (b) {
                  l = Utils.getDistance(p, b);
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
              if (!selectorRect) {
                // Cleanup but keep array reference.
                mouseOverItems.length = 0;
              }

              mouseOverItems.push(
                new PathDataHandle(node, data, commandIndex, handleType)
              );
            }
          });
        }
      });
    }
    return mouseOverItems;
  }

  getMouseOverPathCurve(
    nodes: TreeNode[],
    screenPoint: DOMPoint,
    accuracy = 2
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
      const strokeThickness = Math.max(node.strokeWidth(), accuracy);
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
    // Optimize, skip in a case if outside of the bounds.
    if (
      !Utils.rectIntersectPoint(
        // Shrink a bit so accuracy can also included
        Utils.shrinkRect(nodeBounds, accuracy, accuracy),
        elementPoint
      )
    ) {
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
            const length = Utils.getDistance(elementPoint, pLen);
            if (!lengthLimit || lengthLimit >= length) {
              if (!nearest) {
                nearest = {
                  distance: Number.MAX_VALUE,
                  pathData,
                } as NearestCommandPoint;
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
          const nextLength = Utils.getDistance(nextPointFound, elementPoint);
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
    adornerContainer: AdornerContainer,
    adorners: AdornerContainer[],
    point: DOMPoint
  ): AdornerPointType {
    let toReturn = AdornerPointType.None;
    if (!point || !adornerContainer) {
      return toReturn;
    }
    const config = this.configService.get();

    const rotateArea = 1.5;
    const adorner = adornerContainer.screen;
    // Find nearest point:
    adorner.points.forEach((adornerPoint, key) => {
      let minDistance =
        key === AdornerPointType.Translate
          ? config.translateHandleSize
          : config.handleSize;

      if (
        !minDistance ||
        !this.adornersService.isAdornerActive(adornerContainer, adorners, key)
      ) {
        return;
      }

      const isCenterTransform = key === AdornerPointType.CenterTransform;
      const isTranslate = key === AdornerPointType.Translate;
      if (!adornerPoint && isCenterTransform) {
        adornerPoint = adorner.center;
      }

      let adornerPosition = adornerPoint;
      let v: DOMPoint | null = null;
      if (!isCenterTransform && !isTranslate) {
        v = Utils.getVector(adornerPoint, adorner.center, true);
        // Add displacement so selection will be started a bit outside of the bbox.
        adornerPosition = Utils.alongVector(adornerPoint, v, minDistance);
      }

      const moveAdornerDistance = Utils.getDistance(adornerPosition, point);
      // Rotate adorner displacement:
      let rotateDistance = Number.MAX_VALUE;
      if (v && AdornerTypeUtils.allowToRotateAdorners(key)) {
        const rotateAccuracy = minDistance * rotateArea;
        rotateDistance = Utils.getDistance(
          Utils.alongVector(adornerPoint, v, rotateAccuracy),
          point
        );
      }

      if (
        rotateDistance <= minDistance * rotateArea ||
        moveAdornerDistance <= minDistance
      ) {
        // Move has a priority:
        if (
          rotateDistance + rotateDistance * 0.2 < moveAdornerDistance &&
          !isCenterTransform &&
          !isTranslate
        ) {
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
