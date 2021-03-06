/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
import { Injectable } from "@angular/core";
import { AdornerPointType } from "src/app/models/adorner-point-type";
import { consts } from "src/environments/consts";
import { Adorner, AdornerContainer } from "../../models/adorner";
import { AdornerType } from "../../models/adorner-type";
import { TransformationMode } from "../../models/transformation-mode";
import { AdornersService } from "../adorners-service";
import { ConfigService } from "../config-service";
import { LoggerService } from "../logger.service";
import { MouseOverService } from "../mouse-over.service";
import { OutlineService } from "../outline.service";
import { TransformsService } from "../tools/transforms.service";
import { Utils } from "../utils/utils";
import { BaseRenderer } from "./base.renderer";

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
    private adornersService: AdornersService,
    private mouseOverService: MouseOverService,
    private transform: TransformsService,
    private configService: ConfigService
  ) {
    super();
  }

  getAdornerStroke(
    container: AdornerContainer,
    adornerType: AdornerPointType
  ): string {
    const isSelected = this.mouseOverService.isMouseOverAdornerHandle(
      container,
      adornerType
    );
    if (isSelected) {
      return consts.handleSelectedFillColor;
    }

    return consts.handleFillColor;
  }

  drawAdornersHandles(
    ctx: CanvasRenderingContext2D,
    container: AdornerContainer,
    adorner: Adorner | null
  ): void {
    if (!adorner) {
      return;
    }
    const alongH = Utils.getVector(adorner.topLeft, adorner.topRight, true);
    const alongW = Utils.getVector(adorner.topLeft, adorner.bottomLeft, true);
    const alongHR = Utils.reverseVector(alongH);
    const alongWR = Utils.reverseVector(alongW);
    const handleStroke = consts.handleStrokeColor;

    // top left
    this.drawAdornerHandle(
      ctx,
      adorner.topLeft,
      alongW,
      alongH,
      false,
      handleStroke,
      this.getAdornerStroke(container, AdornerPointType.topLeft)
    );
    // top right
    this.drawAdornerHandle(
      ctx,
      adorner.topRight,
      alongHR,
      alongW,
      false,
      handleStroke,
      this.getAdornerStroke(container, AdornerPointType.topRight)
    );
    // bottom left
    this.drawAdornerHandle(
      ctx,
      adorner.bottomLeft,
      alongWR,
      alongH,
      false,
      handleStroke,
      this.getAdornerStroke(container, AdornerPointType.bottomLeft)
    );
    // bottom right
    this.drawAdornerHandle(
      ctx,
      adorner.bottomRight,
      alongWR,
      alongHR,
      false,
      handleStroke,
      this.getAdornerStroke(container, AdornerPointType.bottomRight)
    );

    // top center
    this.drawAdornerHandle(
      ctx,
      adorner.topCenter,
      alongW,
      alongH,
      true,
      handleStroke,
      this.getAdornerStroke(container, AdornerPointType.topCenter)
    );
    // bottom center
    this.drawAdornerHandle(
      ctx,
      adorner.bottomCenter,
      alongWR,
      alongH,
      true,
      handleStroke,
      this.getAdornerStroke(container, AdornerPointType.bottomCenter)
    );
    // left center
    this.drawAdornerHandle(
      ctx,
      adorner.leftCenter,
      alongH,
      alongW,
      true,
      handleStroke,
      this.getAdornerStroke(container, AdornerPointType.leftCenter)
    );
    // right center
    this.drawAdornerHandle(
      ctx,
      adorner.rightCenter,
      alongHR,
      alongW,
      true,
      handleStroke,
      this.getAdornerStroke(container, AdornerPointType.rightCenter)
    );
  }

  drawAdornerHandle(
    ctx: CanvasRenderingContext2D,
    handlePoint: DOMPoint | null,
    vectorA: DOMPoint | null,
    vectorB: DOMPoint | null,
    center = false,
    strokeColor = consts.handleStrokeColor,
    fillColor = consts.handleFillColor
  ): void {
    if (!handlePoint || !vectorA || !vectorB) {
      console.log("Cannot draw adorner. vector and points should be set.");
      return;
    }
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
    oppositeSidePoint: DOMPoint
  ): void {
    const textHeight = 10;
    ctx.save();

    const center = Utils.getCenterPoint(l1, l2);
    const measured = ctx.measureText(text);
    ctx.translate(center.x, center.y);
    if (Utils.getDirection(l1, l2, oppositeSidePoint) > 0) {
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

  redraw(): void {
    if (!this.ctx) {
      return;
    }
    const ctx = this.ctx;
    this.invalidated = false;
    this.clear();

    const adorners = this.adornersService.getActiveAdorners();
    const selectorAdorner = adorners.find(
      (p) => p.type === AdornerType.selection
    );
    const pathDataSelector = adorners.find(
      (p) => p.type === AdornerType.pathDataSelection
    );
    const activeTransformTransaction = this.transform.activeMode;
    adorners.forEach((adorner) => {
      if (!adorner) {
        return;
      }
      if (pathDataSelector && adorner !== pathDataSelector) {
        return;
      }
      if (pathDataSelector && selectorAdorner && adorner === selectorAdorner) {
        return;
      }
      const main =
        adorner.type === AdornerType.selection ||
        adorner.type === AdornerType.pathDataSelection;
      const isAlt = selectorAdorner && selectorAdorner.enabled && !main;
      const elementsColor = isAlt
        ? consts.altSelectionStroke
        : consts.mainSelectionStroke;
      const elementsThickness = isAlt
        ? consts.altSelectionThickness
        : consts.mainSelectionThickness;

      const converted =
        adorner?.screen?.matrixTransform(this.screenCTM) || null;
      if (adorner.enabled && adorner.showBounds) {
        this.drawAdornerRect(ctx, elementsThickness, elementsColor, converted);
      }
      if (
        this.adornersService.isAdornerActive(
          adorner,
          adorners,
          AdornerPointType.topLeft
        ) &&
        // Don't show scale adorner during the transformation
        activeTransformTransaction === TransformationMode.none
      ) {
        this.drawAdornersHandles(ctx, adorner, converted);
      }

      if (
        this.adornersService.isAdornerActive(
          adorner,
          adorners,
          AdornerPointType.centerTransform
        )
      ) {
        const transformOrigin = converted?.centerTransform || converted?.center;
        if (
          transformOrigin &&
          activeTransformTransaction !== TransformationMode.scale
        ) {
          // Don't show center during the transaction:
          this.drawCross(ctx, transformOrigin);
        }
      }
      if (
        this.adornersService.isAdornerActive(
          adorner,
          adorners,
          AdornerPointType.translate
        )
      ) {
        this.drawMoveHandle(ctx, adorner, converted);
      }

      // draw when resized.
      // this.drawTextOnLine(ctx, "200px", Adorner.topLeft, Adorner.topRight, Adorner.bottomLeft);
      // this.drawTextOnLine(ctx, "100px", Adorner.topRight, Adorner.bottomRight, Adorner.topLeft);
    });
    this.showDebugPoints();
  }
  drawMoveHandle(
    ctx: CanvasRenderingContext2D,
    container: AdornerContainer,
    adorner: Adorner | null
  ): void {
    if (!adorner) {
      return;
    }
    const config = this.configService.get();
    const centerSize = config.translateHandleSize;
    if (!centerSize || !adorner?.translate) {
      return;
    }
    const isMouseOver = this.mouseOverService.isMouseOverAdornerHandle(
      container,
      AdornerPointType.translate
    );
    const p = adorner.translate;
    const thickness = config.translateHandleThickness;
    const fillColor = isMouseOver
      ? config.translateHandleMouseOverFillColor
      : "";
    const strokeColor = isMouseOver
      ? config.translateHandleMouseOverColor
      : config.translateHandleColor;
    this.drawRect(
      ctx,
      new DOMRect(
        p.x - centerSize / 2,
        p.y - centerSize / 2,
        centerSize,
        centerSize
      ),
      thickness,
      strokeColor,
      fillColor
    );
    this.drawCross(ctx, p, centerSize / 2 - 1, strokeColor, thickness);
  }
  showDebugPoints(): void {
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }
    const trans = this.transform?.activeAction?.transformations || [];
    trans.forEach((p) => {
      if (p.debugPoints) {
        p.debugPoints.forEach((point) => {
          if (point) {
            const test = point.matrixTransform(this.screenCTM);
            this.drawCross(ctx, test);
          }
        });
      }
    });
  }
}
