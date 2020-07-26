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

@Injectable({
  providedIn: "root",
})
export class PathRenderer extends BaseRenderer {
  constructor(
    protected viewService: ViewService,
    protected logger: LoggerService,
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
    node: TreeNode,
    point: DOMPoint,
    size: number,
    stroke: string = "black",
    fill: string = null
  ) {
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = stroke;
    this.ctx.ellipse(point.x, point.y, size, size, 0, 0, 360);
    this.ctx.stroke();
  }

  redraw() {
    if (!this.ctx) {
      return;
    }

    this.clear();
    this.invalidated = false;
    const nodes = this.selectionService.getSelected();
    this.ctx.save();
    nodes.forEach((node) => {
      const data = node.getPathData();
      if (data && data.commands) {
        const ctm = this.screenCTM.multiply(node.getScreenCTM());
        let prevPoint: DOMPoint = null;
        data.commands.forEach((command, index) => {
          // const prev = index > 0 ? data.commands[index - 1] : null;
          const abs = command.getAbsolute();
          if (!abs) {
            return;
          }
          const p = abs.p;
          if (!p) {
            return;
          }
          const point = p.matrixTransform(ctm);

          // draw handles:
          if (
            abs.type === PathType.cubicBezier ||
            abs.type === PathType.cubicBezierAbs
          ) {
            const c = abs;

            const a = c.a.matrixTransform(ctm);
            const b = c.b.matrixTransform(ctm);
            // handles:
            this.drawHandle(
              node,
              a,
              consts.pathHandleSize,
              consts.pathHandleStroke
            );
            this.drawHandle(
              node,
              b,
              consts.pathHandleSize,
              consts.pathHandleStroke
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
            abs.type === PathType.shorthandSmooth ||
            abs.type === PathType.shorthandSmoothAbs
          ) {
            const c = abs;
            const a = c.a.matrixTransform(ctm);
            this.drawHandle(
              node,
              a,
              consts.pathHandleSize,
              consts.pathHandleStroke
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
          } else if (
            abs.type === PathType.quadraticBezier ||
            abs.type === PathType.quadraticBezierAbs
          ) {
            const c = abs;
            const a = c.a.matrixTransform(ctm);
            this.drawHandle(
              node,
              a,
              consts.pathHandleSize,
              consts.pathHandleStroke
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
              node,
              rx,
              consts.pathHandleSize,
              consts.pathHandleStroke
            );

            let ry = new DOMPoint(center.x, center.y + r.y);
            ry = ry.matrixTransform(
              ctm
                .translate(center.x, center.y)
                .rotate(c.rotation)
                .translate(-center.x, -center.y)
            );

            this.drawHandle(
              node,
              ry,
              consts.pathHandleSize,
              consts.pathHandleStroke
            );

            center = center.matrixTransform(ctm);
            this.drawHandle(
              node,
              center,
              consts.pathHandleSize,
              consts.pathHandleStroke
            );
          }

          if (point) {
            this.drawPoint(
              node,
              point,
              consts.pathPointSize,
              abs.selected ? "red" : consts.pathHandleStroke,
              abs.selected ? "red" : consts.pathPointFill
            );
          }

          prevPoint = point;
        });
      }
    });
    this.ctx.restore();
  }
}
