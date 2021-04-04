import { Injectable } from "@angular/core";
import { PathDataHandleType } from "src/app/models/path-data-handle-type";
import { PathDirectSelectionToolMode } from "src/app/models/path-direct-selection-tool-mode";
import { PathDataCommand } from "src/app/models/path/path-data-command";
import { PathType } from "src/app/models/path/path-type";
import { TreeNode } from "src/app/models/tree-node";
import { consts } from "src/environments/consts";
import { MouseEventArgs } from "../../models/mouse-event-args";
import { NearestCommandPoint } from "../intersection.service";
import { LoggerService } from "../logger.service";
import { MouseOverService } from "../mouse-over.service";
import { SelectionService } from "../selection.service";
import { PointOnPathUtils } from "../utils/path-utils/point-on-path";
import { Utils } from "../utils/utils";
import { ViewService } from "../view.service";
import { BaseRenderer } from "./base.renderer";

@Injectable({
  providedIn: "root",
})
export class PathRenderer extends BaseRenderer {
  debugHandle: NearestCommandPoint | null = null;
  private mode = PathDirectSelectionToolMode.select;
  constructor(
    protected viewService: ViewService,
    protected logger: LoggerService,
    private mouseOverService: MouseOverService,
    private selectionService: SelectionService
  ) {
    super();
    this.suspend();
  }
  set drawMode(value: PathDirectSelectionToolMode) {
    if (value !== this.mode) {
      this.mode = value;
      this.invalidate();
    }
  }
  get drawMode(): PathDirectSelectionToolMode {
    return this.mode;
  }
  onWindowMouseMove(event: MouseEventArgs): void {}

  drawPoint(
    node: TreeNode,
    point: DOMPoint,
    size: number,
    stroke: string = "black",
    fill: string | null = null
  ): void {
    if (!this.ctx) {
      return;
    }
    const half = size / 2;
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = stroke;
    if (fill) {
      this.ctx.fillStyle = fill;
      this.ctx.fillRect(point.x - half, point.y - half, size, size);
    }
    this.ctx.strokeRect(point.x - half, point.y - half, size, size);
  }

  drawHandle(
    point: DOMPoint,
    size: number,
    stroke: string = "black",
    fill: string | null = null
  ): void {
    if (!point || !this.ctx) {
      return;
    }
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;

    this.ctx.ellipse(point.x, point.y, size, size, 0, 0, 360);
    if (stroke) {
      this.ctx.strokeStyle = stroke;
      this.ctx.stroke();
    }
    if (fill) {
      this.ctx.fillStyle = fill;
      this.ctx.fill();
    }
  }

  redraw(): void {
    if (!this.ctx || !this.screenCTM) {
      return;
    }

    this.clear();
    this.invalidated = false;
    const nodes = this.selectionService.getSelected();
    this.ctx.save();
    nodes.forEach((node, index) => {
      const data = node.getPathData();

      if (data && data.commands) {
        if (consts.showPathOutline) {
          this.drawPathOutline(
            node,
            consts.outlineStrokeColor,
            consts.outlineThickness
          );
        }
        const nodeMatrix = node.getScreenCTM();
        if (!nodeMatrix) {
          return;
        }
        const ctm = this.screenCTM.multiply(nodeMatrix);
        let prevPoint: DOMPoint | null = null;
        data.forEach((command, commandIndex) => {
          // const prev = index > 0 ? data.commands[index - 1] : null;
          const abs = command;
          if (!abs || !abs.p) {
            return;
          }

          const point = abs.p.matrixTransform(ctm);
          if (!point) {
            return;
          }

          /* Debug: Draw command bounds
          this.drawRect(
            this.ctx,
            2,
            "red",
            null,
            MatrixUtils.matrixRectTransform(
              Utils.shrinkRect(abs.getBounds(), 2, 2),
              ctm
            )
          );*/

          const isSelected = this.selectionService.pathDataSubject.getHandle(
            node,
            command,
            PathDataHandleType.point
          );

          if (
            this.logger.isDebug() &&
            this.debugHandle &&
            this.debugHandle.allPoints
          ) {
            const len = this.debugHandle?.allPoints?.length || 0;
            this.debugHandle.allPoints.forEach((pointToDraw, i) => {
              if (!pointToDraw) {
                return;
              }
              this.drawHandle(
                pointToDraw.matrixTransform(ctm),
                consts.pathHandleSize,
                consts.pathHandleStroke,
                i === len - 1 ? "red" : "green"
              );
            });
          }

          this.drawHandlesAndOutlines(node, command, ctm, point, prevPoint);
          if (point) {
            if (abs.isType(PathType.closeAbs)) {
              return;
            }
            let handleStroke = consts.pathPointStroke;
            let handleFill = consts.pathPointFill;
            const mouseOver = this.mouseOverService.pathDataSubject.getHandle(
              node,
              command
            );
            let size = consts.pathPointSize;
            if (mouseOver) {
              handleStroke = consts.pathMouseOverPointStroke;
              handleFill = consts.pathMouseOverPointFill;
              size = consts.pathPointMouseOverSize;
            } else if (isSelected) {
              handleStroke = consts.pathSelectedPointStroke;
              handleFill = consts.pathSelectedPointFill;
              size = consts.pathPointSelectedSize;
            }

            this.drawPoint(node, point, size, handleStroke, handleFill);
          }

          prevPoint = point;
        });
      }
    });

    // Draw new point to be added
    const values = this.mouseOverService.pathDataSubject
      .getValues()
      .filter(
        (p) =>
          p.type === PathDataHandleType.curve &&
          this.drawMode === PathDirectSelectionToolMode.add
      );
    values.forEach((handler) => {
      const matrix = handler?.node?.getScreenCTM();
      if (!matrix) {
        return;
      }
      const ctm = this.screenCTM.multiply(matrix);
      if (handler.point) {
        this.drawHandle(
          handler.point.matrixTransform(ctm),
          consts.pathHandleSize,
          consts.pathHandleStroke,
          "red"
        );
      }
    });

    this.ctx.restore();
  }

  drawHandlesAndOutlines(
    node: TreeNode,
    abs: PathDataCommand,
    ctm: DOMMatrix,
    point: DOMPoint | null,
    prevPoint: DOMPoint | null
  ): void {
    const ctx = this.ctx;
    if (!ctx) {
      console.log("Cannot draw handles, render context is not ready.");
      return;
    }
    if (!point || !prevPoint) {
      console.log("Point cannot be null");
      return;
    }
    const isCurveSelected = !!this.mouseOverService.pathDataSubject.getHandle(
      node,
      abs,
      PathDataHandleType.curve
    );

    const outlineColor = consts.outlineSelectedStrokeColor;
    const outlineThickness = consts.outlineSelectedThickness;

    let isHandleASelected = false;
    let isHandleBSelected = false;
    const drawHandles = this.selectionService.isPathHandlesActivated(node, abs);
    if (drawHandles) {
      isHandleASelected = !!this.mouseOverService.pathDataSubject.getHandle(
        node,
        abs,
        PathDataHandleType.handleA
      );

      isHandleBSelected = !!this.mouseOverService.pathDataSubject.getHandle(
        node,
        abs,
        PathDataHandleType.handleB
      );
    }

    // Draw only mouse over outline:
    const drawPathOutline = isCurveSelected && !!Path2D;
    if (drawHandles || drawPathOutline) {
      // draw handles:
      if (
        abs.type === PathType.cubicBezierAbs ||
        abs.type === PathType.shorthandSmoothAbs
      ) {
        const c = abs;
        let a = c.a;
        let b = c.b;

        a = a?.matrixTransform(ctm) || null;
        b = b?.matrixTransform(ctm) || null;
        if (!a || !b) {
          return;
        }
        if (drawPathOutline) {
          ctx.moveTo(prevPoint.x, prevPoint.y);
          ctx.bezierCurveTo(a.x, a.y, b.x, b.y, point.x, point.y);
          ctx.lineWidth = outlineThickness;
          ctx.strokeStyle = outlineColor;
          ctx.stroke();
        }

        if (!drawHandles) {
          return;
        }
        const aSame =
          Utils.samePoints(prevPoint, a) || Utils.samePoints(point, a);
        if (!aSame) {
          // handle lines:
          this.drawPath(
            this.ctx,
            1,
            consts.pathHandleLineStroke,
            null,
            false,
            prevPoint,
            a
          );
        }
        const bSame =
          Utils.samePoints(prevPoint, b) || Utils.samePoints(point, b);
        if (!Utils.samePoints(point, b)) {
          this.drawPath(
            this.ctx,
            1,
            consts.pathHandleLineStroke,
            null,
            false,
            point,
            b
          );
        }
        if (!aSame) {
          // handles:
          this.drawHandle(
            a,
            isHandleASelected
              ? consts.pathHandleSelectedSize
              : consts.pathHandleSize,
            isHandleASelected
              ? consts.pathHandleSelectedStroke
              : consts.pathHandleStroke,
            isHandleASelected
              ? consts.pathHandleSelectedFill
              : consts.pathHandleFill
          );
        }
        if (!bSame) {
          this.drawHandle(
            b,
            isHandleBSelected
              ? consts.pathHandleSelectedSize
              : consts.pathHandleSize,
            isHandleBSelected
              ? consts.pathHandleSelectedStroke
              : consts.pathHandleStroke,
            isHandleBSelected
              ? consts.pathHandleSelectedFill
              : consts.pathHandleFill
          );
        }
      } else if (
        abs?.a &&
        prevPoint &&
        (abs.type === PathType.quadraticBezierAbs ||
          abs.type === PathType.smoothQuadraticBezierAbs)
      ) {
        const a = abs.a.matrixTransform(ctm);

        if (drawPathOutline) {
          const path2d = new Path2D();
          path2d.moveTo(prevPoint.x, prevPoint.y);
          path2d.quadraticCurveTo(a.x, a.y, point.x, point.y);
          ctx.lineWidth = outlineThickness;
          ctx.strokeStyle = outlineColor;
          ctx.stroke(path2d);
        }
        if (!drawHandles) {
          return;
        }

        const aSame = Utils.samePoints(prevPoint, a);
        if (!aSame) {
          this.drawPath(
            this.ctx,
            1,
            consts.pathHandleLineStroke,
            null,
            false,
            point,
            a
          );
        }
        this.drawPath(
          this.ctx,
          1,
          consts.pathHandleLineStroke,
          null,
          false,
          prevPoint,
          a
        );
        if (!aSame) {
          this.drawHandle(
            a,
            isHandleASelected
              ? consts.pathHandleSelectedSize
              : consts.pathHandleSize,
            isHandleASelected
              ? consts.pathHandleSelectedStroke
              : consts.pathHandleStroke,
            isHandleASelected
              ? consts.pathHandleSelectedFill
              : consts.pathHandleFill
          );
        }
      } else if (abs.isType(PathType.arcAbs)) {
        const c = abs;
        if (drawPathOutline) {
          // TODO: draw outline for arc path data.
          const curves = c.arcApproxCurves();
          if (curves && prevPoint) {
            let start = prevPoint;
            curves.forEach((p) => {
              ctx.moveTo(start.x, start.y);
              const subA = new DOMPoint(p[0], p[1]).matrixTransform(ctm);
              const subB = new DOMPoint(p[2], p[3]).matrixTransform(ctm);
              const end = new DOMPoint(p[4], p[5]).matrixTransform(ctm);
              ctx.bezierCurveTo(subA.x, subA.y, subB.x, subB.y, end.x, end.y);
              ctx.lineWidth = outlineThickness;
              ctx.strokeStyle = outlineColor;
              ctx.stroke();
              start = end;
            });
          }
        }
        if (!drawHandles) {
          return;
        }

        const m = this.screenCTM.multiply(node.getScreenCTM() || undefined);
        ctx.lineWidth = 1;
        ctx.strokeStyle = consts.pathHandleLineStroke;
        ctx.beginPath();
        ctx.setTransform(m);
        let center = c.center;
        const r = c.getCalculatedRadius();

        if (r && center) {
          try {
            ctx.ellipse(
              center.x,
              center.y,
              r.x,
              r.y,
              Utils.rad(c.rotation || 0),
              0,
              360
            );
          } finally {
            ctx.resetTransform();
          }
          ctx.stroke();
          let rx = new DOMPoint(center.x + r.x, center.y);
          rx = rx.matrixTransform(
            ctm
              .translate(center.x, center.y)
              .rotate(c.rotation)
              .translate(-center.x, -center.y)
          );

          this.drawHandle(
            rx,
            consts.pathHandleSize,
            consts.pathHandleStroke,
            consts.pathHandleFill
          );

          let ry = new DOMPoint(center.x, center.y + r.y);
          ry = ry.matrixTransform(
            ctm
              .translate(center.x, center.y)
              .rotate(c.rotation)
              .translate(-center.x, -center.y)
          );

          this.drawHandle(
            ry,
            consts.pathHandleSize,
            consts.pathHandleStroke,
            consts.pathHandleFill
          );

          center = center?.matrixTransform(ctm);
          this.drawHandle(
            center,
            consts.pathHandleSize,
            consts.pathHandleStroke,
            consts.pathHandleFill
          );
        }
      } else if (!abs.isType(PathType.moveAbs)) {
        if (drawPathOutline) {
          if (abs.isType(PathType.closeAbs)) {
            const prevMove = PointOnPathUtils.getPrevByType(
              abs,
              true,
              PathType.moveAbs
            );
            if (prevMove) {
              point = prevMove.p.matrixTransform(ctm);
            }
          }
          this.drawPath(
            this.ctx,
            outlineThickness,
            outlineColor,
            null,
            false,
            prevPoint,
            point
          );
        }
      }
    }
  }
}
