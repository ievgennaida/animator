import { Injectable } from "@angular/core";
import { PathDataHandleType } from "src/app/models/path-data-handle";
import { PathType } from "src/app/models/path/path-type";
import { TreeNode } from "src/app/models/tree-node";
import { consts } from "src/environments/consts";
import { MouseEventArgs } from "../../../models/mouse-event-args";
import { NearestCommandPoint } from "../../intersection.service";
import { LoggerService } from "../../logger.service";
import { MouseOverService } from "../../mouse-over.service";
import { SelectionService } from "../../selection.service";
import { Utils } from "../../utils/utils";
import { ViewService } from "../../view.service";
import { BaseRenderer } from "./base.renderer";

@Injectable({
  providedIn: "root",
})
export class PathRenderer extends BaseRenderer {
  constructor(
    protected viewService: ViewService,
    protected logger: LoggerService,
    private mouseOverService: MouseOverService,
    private selectionService: SelectionService
  ) {
    super();
    this.suspend();
  }

  debugHandle: NearestCommandPoint = null;

  onWindowMouseMove(event: MouseEventArgs) {}

  drawPoint(
    node: TreeNode,
    point: DOMPoint,
    size: number,
    stroke: string = "black",
    fill: string = null
  ) {
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
    fill: string = null
  ) {
    if (!point) {
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

  redraw() {
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
        let prevPoint: DOMPoint = null;
        data.commands.forEach((command, commandIndex) => {
          // const prev = index > 0 ? data.commands[index - 1] : null;
          const abs = command.getAbsolute();
          if (!abs) {
            return;
          }

          if (abs.type === PathType.closeAbs) {
            return;
          }

          const p = abs.p;
          if (!p) {
            return;
          }
          const point = p.matrixTransform(ctm);
          if (!point) {
            return;
          }

          /* Debug: Draw command bounds
          this.drawRect(
            this.ctx,
            2,
            "red",
            null,
            Utils.matrixRectTransform(
              Utils.shrinkRect(abs.getBounds(), 2, 2),
              ctm
            )
          );*/

          const isSelected = this.selectionService.pathDataSubject.getHandle(
            node,
            commandIndex,
            PathDataHandleType.Point
          );

          if (this.debugHandle && true) {
            this.debugHandle.allPoints.forEach((element, i) => {
              this.drawHandle(
                element.matrixTransform(ctm),
                consts.pathHandleSize,
                consts.pathHandleStroke,
                i === this.debugHandle.allPoints.length - 1 ? "red" : "green"
              );
            });
          }

          this.drawHandlesAndOutlines(
            node,
            commandIndex,
            ctm,
            point,
            prevPoint
          );
          if (point) {
            let handleStroke = consts.pathPointStroke;
            let handleFill = consts.pathPointFill;
            const mouseOver = this.mouseOverService.pathDataSubject.getHandle(
              node,
              commandIndex
            );

            if (mouseOver) {
              handleStroke = consts.pathMouseOverPointStroke;
              handleFill = consts.pathMouseOverPointFill;
            } else if (isSelected) {
              handleStroke = consts.pathSelectedPointStroke;
              handleFill = consts.pathSelectedPointFill;
            }

            this.drawPoint(
              node,
              point,
              isSelected ? consts.pathPointSelectedSize : consts.pathPointSize,
              handleStroke,
              handleFill
            );
          }

          prevPoint = point;
        });
      }
    });
    this.ctx.restore();
  }

  drawHandlesAndOutlines(
    node: TreeNode,
    commandIndex: number,
    ctm: DOMMatrix,
    point: DOMPoint,
    prevPoint: DOMPoint
  ) {
    const data = node.getPathData();
    const abs = data.commands[commandIndex].getAbsolute();

    const isCurveSelected = !!this.mouseOverService.pathDataSubject.getHandle(
      node,
      commandIndex,
      PathDataHandleType.Curve
    );

    const outlineColor = consts.outlineSelectedStrokeColor;
    const outlineThickness = consts.outlineSelectedThickness;

    let isHandleASelected = false;
    let isHandleBSelected = false;
    const drawHandles = this.selectionService.isPathHandlesActivated(
      node,
      commandIndex
    );
    if (drawHandles) {
      isHandleASelected = !!this.mouseOverService.pathDataSubject.getHandle(
        node,
        commandIndex,
        PathDataHandleType.HandleA
      );

      isHandleBSelected = !!this.mouseOverService.pathDataSubject.getHandle(
        node,
        commandIndex,
        PathDataHandleType.HandleB
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
        a = a ? a.matrixTransform(ctm) : null;
        b = b ? b.matrixTransform(ctm) : null;
        if (drawPathOutline) {
          this.ctx.moveTo(prevPoint.x, prevPoint.y);
          this.ctx.bezierCurveTo(a.x, a.y, b.x, b.y, point.x, point.y);
          this.ctx.lineWidth = outlineThickness;
          this.ctx.strokeStyle = outlineColor;
          this.ctx.stroke();
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
        abs.type === PathType.quadraticBezierAbs ||
        abs.type === PathType.smoothQuadraticBezierAbs
      ) {
        const c = abs;
        const a = c.a.matrixTransform(ctm);

        if (drawPathOutline) {
          const path2d = new Path2D();
          path2d.moveTo(prevPoint.x, prevPoint.y);
          path2d.quadraticCurveTo(a.x, a.y, point.x, point.y);
          this.ctx.lineWidth = outlineThickness;
          this.ctx.strokeStyle = outlineColor;
          this.ctx.stroke(path2d);
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
      } else if (abs.type === PathType.arc || abs.type === PathType.arcAbs) {
        const c = abs;
        if (drawPathOutline) {
          // TODO: draw outline for arc path data.
        }
        if (!drawHandles) {
          return;
        }

        const m = this.screenCTM.multiply(node.getScreenCTM());
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = consts.pathHandleLineStroke;
        this.ctx.beginPath();
        this.ctx.setTransform(m);
        let center = c.center;
        const r = c.getCalculatedRadius();
        try {
          this.ctx.ellipse(
            center.x,
            center.y,
            r.x,
            r.y,
            Utils.rad(c.rotation),
            0,
            360
          );
        } finally {
          this.ctx.resetTransform();
        }
        this.ctx.stroke();

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

        center = center.matrixTransform(ctm);
        this.drawHandle(
          center,
          consts.pathHandleSize,
          consts.pathHandleStroke,
          consts.pathHandleFill
        );
      } else {
        if (drawPathOutline) {
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
