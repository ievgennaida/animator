import { Injectable } from "@angular/core";
import { LoggerService } from "../../logger.service";
import { ViewService } from "../../view.service";
import { BaseRenderer } from "./base.renderer";
import { SelectionService } from "../../selection.service";
import { MouseEventArgs } from "../../../models/mouse-event-args";
import { TreeNode } from "src/app/models/tree-node";
import { Utils } from "../../utils/utils";
import { consts } from "src/environments/consts";
import { PathType } from "src/app/models/path/path-type";
import { MouseOverService } from "../../mouse-over.service";
import { environment } from "src/environments/environment";

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
    nodes.forEach((node) => {
      const data = node.getPathData();
      if (data && data.commands) {
        const nodeMatrix = node.getScreenCTM();
        if (!nodeMatrix) {
          return;
        }
        const ctm = this.screenCTM.multiply(nodeMatrix);
        let prevPoint: DOMPoint = null;
        data.commands.forEach((command, commandIndex) => {
          // const prev = index > 0 ? data.commands[index - 1] : null;
          const abs = command.getAbsolute();
          if (!abs || abs.type === PathType.closeAbs) {
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

          const isSelected = this.selectionService.pathDataSubject.getHandle(
            node,
            commandIndex
          );

          const drawHandles = this.selectionService.isPathHandlesActivated(
            node,
            commandIndex
          );
          if (drawHandles) {
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
              // handles:
              this.drawHandle(
                a,
                consts.pathHandleSize,
                consts.pathHandleStroke,
                consts.pathHandleFill
              );
              this.drawHandle(
                b,
                consts.pathHandleSize,
                consts.pathHandleStroke,
                consts.pathHandleFill
              );
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
              this.drawPath(
                this.ctx,
                1,
                consts.pathHandleLineStroke,
                null,
                false,
                point,
                b
              );
            } else if (
              abs.type === PathType.quadraticBezierAbs ||
              abs.type === PathType.smoothQuadraticBezierAbs
            ) {
              const c = abs;
              const a = c.a.matrixTransform(ctm);
              this.drawHandle(
                a,
                consts.pathHandleSize,
                consts.pathHandleStroke,
                consts.pathHandleFill
              );
              this.drawPath(
                this.ctx,
                1,
                consts.pathHandleLineStroke,
                null,
                false,
                point,
                a
              );
              this.drawPath(
                this.ctx,
                1,
                consts.pathHandleLineStroke,
                null,
                false,
                prevPoint,
                a
              );
            } else if (
              abs.type === PathType.arc ||
              abs.type === PathType.arcAbs
            ) {
              const c = abs;
              const m = this.screenCTM.multiply(node.getScreenCTM());
              this.ctx.lineWidth = 1;
              this.ctx.strokeStyle = consts.pathHandleLineStroke;
              this.ctx.beginPath();
              this.ctx.setTransform(m);
              let center = c.center;
              const r = c.r;
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
            }
          }
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
}
