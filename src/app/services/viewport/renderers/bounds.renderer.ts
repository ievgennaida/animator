import { Injectable, NgZone } from "@angular/core";
import { LoggerService } from "../../logger.service";
import { OutlineService } from "../../outline.service";
import { TreeNode } from "src/app/models/tree-node";
import { ViewportService } from "../viewport.service";
import { BaseRenderer } from "./base.renderer";
import { consts } from "src/environments/consts";
import { AdornersDataService } from "../adorners/adorners-data.service";
import { Utils } from "../../utils/utils";
import { AdornerData } from "../adorners/adorner-data";
import { constants } from "buffer";

/**
 * Elements bounds renderer
 */
@Injectable({
  providedIn: "root"
})
export class BoundsRenderer extends BaseRenderer {
  renderableElements = [];
  constructor(
    private viewportService: ViewportService,
    private adornersDataService: AdornersDataService,
    protected outlineService: OutlineService,
    protected logger: LoggerService
  ) {
    super();
    outlineService.flatList.subscribe(flatItems => {
      this.renderableElements = flatItems;
    });
  }
  drawRect(
    ctx: CanvasRenderingContext2D,
    parentCTM: DOMMatrix,
    element: SVGGraphicsElement,
    thikness: number,
    adornerData: AdornerData
  ) {
    this.drawPath(
      ctx,
      thikness,
      consts.adorners.mouseOverBoundsColor,
      null,
      adornerData.topLeft,
      adornerData.topRight,
      adornerData.bottomRight,
      adornerData.bottomLeft
    );
  }

  drawAdornersHandles(ctx: CanvasRenderingContext2D, adornerData: AdornerData) {
    const alongH = Utils.getVector(adornerData.topLeft, adornerData.topRight);
    Utils.normilizeSelf(alongH);
    const alongW = Utils.getVector(adornerData.topLeft, adornerData.bottomLeft);
    Utils.normilizeSelf(alongW);
    const alongHR = Utils.reverseVector(alongH);
    const alongWR = Utils.reverseVector(alongW);
    // top left
    this.drawAdornerHandle(ctx, adornerData.topLeft, alongW, alongH);
    // top right
    this.drawAdornerHandle(ctx, adornerData.topRight, alongHR, alongW);
    // bottom left
    this.drawAdornerHandle(ctx, adornerData.bottomLeft, alongWR, alongH);
    // bottom right
    this.drawAdornerHandle(ctx, adornerData.bottomRight, alongWR, alongHR);

    // top center
    this.drawAdornerHandle(ctx, adornerData.topCenter, alongW, alongH, true);
    // bottom center
    this.drawAdornerHandle(
      ctx,
      adornerData.bottomCenter,
      alongWR,
      alongH,
      true
    );
    // left center
    this.drawAdornerHandle(ctx, adornerData.leftCenter, alongH, alongW, true);
    // right center
    this.drawAdornerHandle(ctx, adornerData.rightCenter, alongHR, alongW, true);
  }
  drawPath(
    ctx: CanvasRenderingContext2D,
    thikness: number,
    stroke: string,
    fillStyle: string,
    ...points: Array<DOMPoint>
  ) {
    ctx.beginPath();

    points.forEach((point, index) => {
      const p = point;
      // const p = this.getSharpPos(point);
      if (index === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        ctx.lineTo(p.x, p.y);
      }
    });

    ctx.closePath();

    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }

    if (thikness) {
      ctx.lineWidth = thikness;
    }

    if (stroke && thikness) {
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  drawAdornerHandle(
    ctx: CanvasRenderingContext2D,
    handlePoint: DOMPoint,
    vectorA: DOMPoint,
    vectorB: DOMPoint,
    center = false
  ) {
    const boxSize = consts.adorners.handleSize;
    const halfSize = boxSize / 2;
    const opposite = new DOMPoint(
      handlePoint.x + vectorA.x * boxSize,
      handlePoint.y + vectorA.y * boxSize
    );

    let fromX = -vectorB.x * boxSize;
    let fromY = -vectorB.y * boxSize;
    let toX = 0;
    let toY = 0;
    if (center) {
      fromX = vectorB.x * halfSize;
      fromY = vectorB.y * halfSize;
      toX = fromX;
      toY = fromY;
    }

    this.drawPath(
      ctx,
      consts.adorners.handleStrokeSize,
      consts.adorners.handleStrokeColor,
      consts.adorners.handleFillColor,
      new DOMPoint(handlePoint.x - fromX, handlePoint.y - fromY),
      new DOMPoint(handlePoint.x + toX, handlePoint.y + toY),
      new DOMPoint(opposite.x + toX, opposite.y + toY),
      new DOMPoint(opposite.x - fromX, opposite.y - fromY)
    );
  }

  drawTextOnLine(
    ctx: CanvasRenderingContext2D,
    text: string,
    l1: DOMPoint,
    l2: DOMPoint,
    opositeSidePoint: DOMPoint
  ) {
    const textHeight = 10;
    ctx.save();

    const center = Utils.getCenter(l1, l2);
    const measured = ctx.measureText(text);
    ctx.translate(center.x, center.y);
    if (Utils.getDirection(l1, l2, opositeSidePoint) > 0) {
      const l3 = l2;
      l2 = l1;
      l1 = l3;
    }

    let angle = -Utils.angle(l1, l2);
    let hOffset = -3;
    if ((angle <= -90 && angle > -180) || (angle > 90 && angle <= 180)) {
      angle = 180 + angle;
      hOffset = textHeight;
    }

    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-center.x, -center.y);

    ctx.fillText(text, center.x - measured.width / 2, center.y + hOffset);
    ctx.restore();
  }
  drawCenterTransformPoint(ctx: CanvasRenderingContext2D, p: DOMPoint) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    p = this.getSharpPos(p);
    const centerSize = 5;
    ctx.moveTo(p.x - centerSize, p.y);
    ctx.lineTo(p.x + centerSize, p.y);
    ctx.moveTo(p.x, p.y - centerSize);
    ctx.lineTo(p.x, p.y + centerSize);
    ctx.stroke();
    ctx.closePath();
  }

  redraw(ctx: CanvasRenderingContext2D) {
    this.clearBackground(ctx);
    const parent = this.viewportService.viewport
      .ownerSVGElement as SVGSVGElement;
    const parentCTM =  this.canvasCTM.multiply(parent.getScreenCTM().inverse());
  
    // let selectedRect:DOMRect = null;
    // TODO: performance iterate only selected and active
    if (this.renderableElements && this.renderableElements.length > 0) {
      const renderable = this.renderableElements.filter(
        p =>
          p.tag &&
          (p.tag instanceof SVGGraphicsElement ||
            p.tag.layerElement instanceof SVGGraphicsElement)
      );

      renderable
        .forEach((node: TreeNode) => {
          let element = node.tag as SVGGraphicsElement;
          if (element && !(element instanceof SVGGraphicsElement)) {
            element = node.tag.layerElement as SVGGraphicsElement;
          }

          if (
            element &&
            element instanceof SVGGraphicsElement &&
            (node.mouseOver || node.selected)
          ) {
            if (node.mouseOver && !node.selected) {
              let adornerData = this.adornersDataService.getElementAdornerData(
                element
              );
              // Convert element position on zoomed parent and then to a canvas coordites.
              const ctm = parentCTM.multiply(element.getScreenCTM());
              adornerData = adornerData.getTransformed(ctm);

              const thikness =
                consts.adorners.mouseOverBorderThikness * this.onePixel;
              this.drawRect(ctx, parentCTM, element, thikness, adornerData);
            } else {
              const thikness = 2;
              let adornerData = this.adornersDataService.getElementAdornerData(
                element
              );
              const ctm = parentCTM.multiply(element.getScreenCTM());
              adornerData = adornerData.getTransformed(ctm);
              this.drawRect(ctx, parentCTM, element, thikness, adornerData);
                            // draw when resized.
              // this.drawTextOnLine(ctx, "200px", adornerData.topLeft, adornerData.topRight, adornerData.bottomLeft);
              // this.drawTextOnLine(ctx, "100px", adornerData.topRight, adornerData.bottomRight, adornerData.topLeft);
              // this.drawAdornersHandles(ctx, adornerData);
              // this.drawCenterTransformPoint(ctx, adornerData.centerTransform);
            }
          }
        });
    }
  }
}
