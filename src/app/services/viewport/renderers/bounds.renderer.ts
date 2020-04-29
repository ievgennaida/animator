import { Injectable } from "@angular/core";
import { LoggerService } from "../../logger.service";
import { OutlineService } from "../../outline.service";
import { TreeNode } from "src/app/models/tree-node";
import { BaseRenderer } from "./base.renderer";
import { consts } from "src/environments/consts";
import { Utils } from "../../utils/utils";
import { AdornerData } from "../adorners/adorner-data";
import { SelectionService } from "../../selection.service";
import { AdornerType } from '../adorners/adorner-type';

/**
 * Elements bounds renderer
 */
@Injectable({
  providedIn: "root",
})
export class BoundsRenderer extends BaseRenderer {
  constructor(
    protected outlineService: OutlineService,
    protected logger: LoggerService,
    private selectionService: SelectionService
  ) {
    super();
  }

  drawAdornersHandles(ctx: CanvasRenderingContext2D, adornerData: AdornerData) {
    const alongH = Utils.getVector(adornerData.topLeft, adornerData.topRight);
    Utils.normilizeSelf(alongH);
    const alongW = Utils.getVector(adornerData.topLeft, adornerData.bottomLeft);
    Utils.normilizeSelf(alongW);
    const alongHR = Utils.reverseVector(alongH);
    const alongWR = Utils.reverseVector(alongW);
    const handleStroke = consts.handleStrokeColor;
    const fillStroke = consts.handleFillColor;
    const selectedFillStroke = consts.handleSelectedFillColor;
    // top left
    this.drawAdornerHandle(
      ctx,
      adornerData.topLeft,
      alongW,
      alongH,
      false,
      handleStroke,
      adornerData.isSelected(AdornerType.TopLeft) ? selectedFillStroke : fillStroke
    );
    // top right
    this.drawAdornerHandle(
      ctx,
      adornerData.topRight,
      alongHR,
      alongW,
      false,
      handleStroke,
      adornerData.isSelected(AdornerType.TopRight) ? selectedFillStroke : fillStroke
    );
    // bottom left
    this.drawAdornerHandle(
      ctx,
      adornerData.bottomLeft,
      alongWR,
      alongH,
      false,
      handleStroke,
      adornerData.isSelected(AdornerType.BottomLeft)
        ? selectedFillStroke
        : fillStroke
    );
    // bottom right
    this.drawAdornerHandle(
      ctx,
      adornerData.bottomRight,
      alongWR,
      alongHR,
      false,
      handleStroke,
      adornerData.isSelected(AdornerType.BottomRight)
        ? selectedFillStroke
        : fillStroke
    );

    // top center
    this.drawAdornerHandle(
      ctx,
      adornerData.topCenter,
      alongW,
      alongH,
      true,
      handleStroke,
      adornerData.isSelected(AdornerType.TopCenter)
        ? selectedFillStroke
        : fillStroke
    );
    // bottom center
    this.drawAdornerHandle(
      ctx,
      adornerData.bottomCenter,
      alongWR,
      alongH,
      true,
      handleStroke,
      adornerData.isSelected(AdornerType.BottomCenter)
        ? selectedFillStroke
        : fillStroke
    );
    // left center
    this.drawAdornerHandle(
      ctx,
      adornerData.leftCenter,
      alongH,
      alongW,
      true,
      handleStroke,
      adornerData.isSelected(AdornerType.LeftCenter)
        ? selectedFillStroke
        : fillStroke
    );
    // right center
    this.drawAdornerHandle(
      ctx,
      adornerData.rightCenter,
      alongHR,
      alongW,
      true,
      handleStroke,
      adornerData.isSelected(AdornerType.RightCenter)
        ? selectedFillStroke
        : fillStroke
    );
  }

  drawAdornerHandle(
    ctx: CanvasRenderingContext2D,
    handlePoint: DOMPoint,
    vectorA: DOMPoint,
    vectorB: DOMPoint,
    center = false,
    strokeColor = consts.handleStrokeColor,
    fillColor = consts.handleFillColor
  ) {
    const boxSize = consts.handleSize;
    const halfSize = boxSize / 2;
    const oppositeX = handlePoint.x + vectorA.x * boxSize;
    const oppositeY = handlePoint.y + vectorA.y * boxSize;

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
      consts.handleStrokeSize,
      strokeColor,
      fillColor,
      true,
      new DOMPoint(handlePoint.x - fromX, handlePoint.y - fromY),
      new DOMPoint(handlePoint.x + toX, handlePoint.y + toY),
      new DOMPoint(oppositeX + toX, oppositeY + toY),
      new DOMPoint(oppositeX - fromX, oppositeY - fromY)
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

    const center = Utils.getCenterPoint(l1, l2);
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

  redraw() {
    if (!this.ctx) {
      return;
    }
    const ctx = this.ctx;
    this.invalidated = false;
    this.clear();
    const nodes = this.selectionService.getSelected();
    if (nodes && nodes.length > 0) {
      const renderable = nodes.filter((node) => !!node.getElement());
      const multiple = renderable.length > 1;

      const elementsColor = multiple
        ? consts.altSelectionStroke
        : consts.mainSelectionStroke;
      const elementsThinkness = multiple
        ? consts.altSelectionThikness
        : consts.mainSelectionThikness;

      renderable.forEach((node: TreeNode) => {
        if (node.selected) {
          const adornerData = node.getScreenAdorners(this.screenCTM);
          if (adornerData) {
            this.drawAdornerRect(
              ctx,
              elementsThinkness,
              elementsColor,
              adornerData
            );
            if (!multiple) {
              // draw when resized.
              // this.drawTextOnLine(ctx, "200px", adornerData.topLeft, adornerData.topRight, adornerData.bottomLeft);
              // this.drawTextOnLine(ctx, "100px", adornerData.topRight, adornerData.bottomRight, adornerData.topLeft);
              this.drawAdornersHandles(ctx, adornerData);
              this.drawCross(ctx, adornerData.centerTransform);
            }
          }
        }
      });

      // Draw global bounds:
      if (renderable && renderable.length > 1) {
        // TODO: cached, reuse
        const adroners = renderable.map((p) =>
          p.getScreenAdorners(this.screenCTM)
        );
        const bounds = Utils.getBBoxBounds(...adroners);
        this.drawPath(
          ctx,
          consts.mainSelectionThikness,
          consts.mainSelectionStroke,
          null,
          true,
          new DOMPoint(bounds.x, bounds.y),
          new DOMPoint(bounds.x + bounds.width, bounds.y),
          new DOMPoint(bounds.x + bounds.width, bounds.y + bounds.height),
          new DOMPoint(bounds.x, bounds.y + bounds.height)
        );
        // let totalBounds = Utils.getBBoxBounds(...renderable);
        // this.drawAdornerRect(ctx, consts.mainSelectionThikness, consts.mainSelectionStroke, adornerData);
        // this.adornersDataService.getElementAdornerData(null,totalBounds);
      }
    }
  }
}
