import { Injectable } from "@angular/core";
import { AdornerContainer } from "../models/adorner";
import { AdornerPointType } from "../models/adorner-point-type";
import { AdornerTypeUtils } from "../models/adorner-type-utils";
import { HandleData } from "../models/handle-data";
import { PathDataHandle } from "../models/path-data-handle";
import { PathDataHandleType } from "../models/path-data-handle-type";
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
  getIntersects(
    screenRect: DOMRect | null,
    onlyFirst: boolean = false
  ): TreeNode[] {
    if (!screenRect) {
      return [];
    }
    const selected: TreeNode[] = [];
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
    screenPoint: DOMPoint | null
  ): HandleData | null {
    let results: HandleData | null = null;
    const adorners = this.adornersService.getActiveAdorners();
    if (!adorners) {
      return null;
    }

    for (const adorner of adorners) {
      if (!adorner) {
        continue;
      }

      const intersects = this.intersectAdorner(adorner, adorners, screenPoint);
      if (intersects !== AdornerPointType.none) {
        if (!results) {
          results = new HandleData();
        }
        results.adorner = adorner;
        results.handle = intersects;
        break;
      }
    }
    return results;
  }
  /**
   * get path data handles under the point or rectangle.
   *
   * @param nodes list of nodes with path data.
   * @param selectorRectOrPos rect or point in screen coordinates.
   */
  intersectPathDataHandles(
    nodes: TreeNode[],
    selectorRectOrPos: DOMRect | DOMPoint | null,
    includeHandles = true
  ): PathDataHandle[] {
    if (!selectorRectOrPos) {
      return [];
    }
    const mouseOverItems: PathDataHandle[] = [];
    const config = this.configService.get();
    const rectSelector = selectorRectOrPos as DOMRect;
    const isRect = rectSelector.width || rectSelector.width === 0;
    const screenPos = selectorRectOrPos as DOMPoint;
    if (nodes) {
      let prevBestDistance = Number.MAX_VALUE;
      nodes.forEach((node) => {
        const data = node.getPathData();
        const p = !isRect ? Utils.toElementPoint(node, screenPos) : null;
        if (data && data.commands) {
          data.forEach((command, commandIndex) => {
            const abs = command;
            if (abs.type === PathType.closeAbs) {
              return;
            }

            let pointSelected = false;
            if (isRect) {
              pointSelected = Utils.rectIntersectPoint(
                rectSelector,
                Utils.toScreenPoint(node, abs.p)
              );
            }
            let handleType = PathDataHandleType.point;
            if (p && !isRect) {
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
              const handlesActivated =
                includeHandles &&
                this.selectionService.isPathHandlesActivated(node, command);
              if (handlesActivated) {
                accuracy = screenPointSize * config.pathHandleSelectedSize;
                const a = abs.a;
                if (a) {
                  l = Utils.getDistance(p, a);
                  if (l <= accuracy && prevBestDistance > l) {
                    handleType = PathDataHandleType.handleA;
                    prevBestDistance = l;
                    pointSelected = true;
                  }
                }
                const b = abs.b;
                if (b) {
                  l = Utils.getDistance(p, b);
                  if (l <= accuracy && prevBestDistance > l) {
                    handleType = PathDataHandleType.handleB;
                    prevBestDistance = l;
                    pointSelected = true;
                  }
                }
              }
            }

            if (pointSelected) {
              // Return only one when selected by screen point.
              if (!isRect) {
                // Cleanup but keep array reference.
                mouseOverItems.length = 0;
              }

              mouseOverItems.push(
                new PathDataHandle(node, command, handleType)
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
    let nearest: NearestCommandPoint | null = null;

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
    elementPoint: DOMPoint | null,
    shrinkBounds: number = 0,
    accuracy: number = 0.01,
    lengthLimit: number | null = null
  ): NearestCommandPoint | null {
    if (!node) {
      return null;
    }
    const nodeBounds = node.getBBox();
    if (!nodeBounds) {
      return null;
    }
    shrinkBounds = Math.max(
      shrinkBounds,
      accuracy,
      nodeBounds.width / 4,
      nodeBounds.height / 4
    );

    // Optimize, skip in a case if outside of the bounds.
    if (
      !Utils.rectIntersectPoint(
        // Shrink a bit so accuracy offset can also included
        Utils.shrinkRect(nodeBounds, shrinkBounds, shrinkBounds),
        elementPoint
      )
    ) {
      return null;
    }

    const pathData = node.getPathData();
    if (!pathData) {
      return null;
    }

    let nearest: NearestCommandPoint | null = null;
    const expectedLen = 8;
    let usedStep = 0;
    let bestPositionOnFragment = 0;
    let index = 0;
    // Linear search, find nearest command first.
    for (const command of pathData.commands) {
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
            index++;
            continue;
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
                if (this.logger.isDebug() && !nearest.allPoints) {
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

      index++;
    }

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
        if (nextPointFound && nearest) {
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
    point: DOMPoint | null
  ): AdornerPointType {
    let toReturn = AdornerPointType.none;
    if (!point || !adornerContainer) {
      return toReturn;
    }
    const config = this.configService.get();

    const rotateArea = 1.5;
    const adorner = adornerContainer.screen;
    // Find nearest point:
    adorner?.points.forEach((adornerPoint, key) => {
      let minDistance =
        key === AdornerPointType.translate
          ? config.translateHandleSize
          : config.handleSize;

      if (
        !minDistance ||
        !adornerPoint ||
        !this.adornersService.isAdornerActive(adornerContainer, adorners, key)
      ) {
        return;
      }

      const isCenterTransform = key === AdornerPointType.centerTransform;
      const isTranslate = key === AdornerPointType.translate;
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
