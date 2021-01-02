// tslint:disable: variable-name
import { Injectable } from "@angular/core";
import { consts } from "src/environments/consts";
import { TransformationMode } from "../../actions/transformations/transformation-mode";
import { AdornersService } from "../../adorners-service";
import { ConfigService } from "../../config-service";
import { LoggerService } from "../../logger.service";
import { MouseOverService } from "../../mouse-over.service";
import { OutlineService } from "../../outline.service";
import { Utils } from "../../utils/utils";
import { Adorner, AdornerContainer } from "../adorners/adorner";
import { AdornerPointType, AdornerType } from "../adorners/adorner-type";
import { TransformsService } from "../transforms.service";
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

  /**
   * Value indicating whether main selection should be rendered
   */
  // tslint:disable-next-line: variable-name
  private _suppressMainSelection = true;
  get suppressMainSelection() {
    return this._suppressMainSelection;
  }
  set suppressMainSelection(value: boolean) {
    if (this._suppressMainSelection !== value) {
      this._suppressMainSelection = value;
      this.invalidate();
    }
  }

  private _drawPathDataPointsHandle = false;
  get drawPathDataPointsHandle(): boolean {
    return this._drawPathDataPointsHandle;
  }
  set drawPathDataPointsHandle(value: boolean) {
    if (this._drawPathDataPointsHandle !== value) {
      this._drawPathDataPointsHandle = value;
      this.invalidate();
    }
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
    adorner: Adorner
  ) {
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
      this.getAdornerStroke(container, AdornerPointType.TopLeft)
    );
    // top right
    this.drawAdornerHandle(
      ctx,
      adorner.topRight,
      alongHR,
      alongW,
      false,
      handleStroke,
      this.getAdornerStroke(container, AdornerPointType.TopRight)
    );
    // bottom left
    this.drawAdornerHandle(
      ctx,
      adorner.bottomLeft,
      alongWR,
      alongH,
      false,
      handleStroke,
      this.getAdornerStroke(container, AdornerPointType.BottomLeft)
    );
    // bottom right
    this.drawAdornerHandle(
      ctx,
      adorner.bottomRight,
      alongWR,
      alongHR,
      false,
      handleStroke,
      this.getAdornerStroke(container, AdornerPointType.BottomRight)
    );

    // top center
    this.drawAdornerHandle(
      ctx,
      adorner.topCenter,
      alongW,
      alongH,
      true,
      handleStroke,
      this.getAdornerStroke(container, AdornerPointType.TopCenter)
    );
    // bottom center
    this.drawAdornerHandle(
      ctx,
      adorner.bottomCenter,
      alongWR,
      alongH,
      true,
      handleStroke,
      this.getAdornerStroke(container, AdornerPointType.BottomCenter)
    );
    // left center
    this.drawAdornerHandle(
      ctx,
      adorner.leftCenter,
      alongH,
      alongW,
      true,
      handleStroke,
      this.getAdornerStroke(container, AdornerPointType.LeftCenter)
    );
    // right center
    this.drawAdornerHandle(
      ctx,
      adorner.rightCenter,
      alongHR,
      alongW,
      true,
      handleStroke,
      this.getAdornerStroke(container, AdornerPointType.RightCenter)
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
    oppositeSidePoint: DOMPoint
  ) {
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

  redraw() {
    if (!this.ctx) {
      return;
    }
    const ctx = this.ctx;
    this.invalidated = false;
    this.clear();

    const adorners = this.adornersService.getActiveAdorners();
    const multiple = !!adorners.find((p) => p.type === AdornerType.Selection);
    const activeTransformTransaction = this.transform.activeMode;
    adorners.forEach((adorner) => {
      if (!adorner) {
        return;
      }

      const main = adorner.type === AdornerType.Selection;
      const isAlt = (multiple || this.suppressMainSelection) && !main;
      const elementsColor = isAlt
        ? consts.altSelectionStroke
        : consts.mainSelectionStroke;
      const elementsThickness = isAlt
        ? consts.altSelectionThickness
        : consts.mainSelectionThickness;

      const converted = adorner.screen.matrixTransform(this.screenCTM);
      this.drawAdornerRect(ctx, elementsThickness, elementsColor, converted);

      if (
        (this.adornersService.isAdornerActive(
          adorner,
          adorners,
          AdornerPointType.TopLeft
        ) &&
          // Don't show scale adorner during the transformation
          activeTransformTransaction === TransformationMode.None) ||
        activeTransformTransaction === TransformationMode.Scale
      ) {
        this.drawAdornersHandles(ctx, adorner, converted);
      }

      if (
        this.adornersService.isAdornerActive(
          adorner,
          adorners,
          AdornerPointType.CenterTransform
        )
      ) {
        const transformOrigin = converted.centerTransform || converted.center;
        if (transformOrigin) {
          // Don't show center during the transaction:
          this.drawCross(ctx, transformOrigin);
        }
      }
      if (
        this.adornersService.isAdornerActive(
          adorner,
          adorners,
          AdornerPointType.Translate
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
    adorner: Adorner
  ) {
    const config = this.configService.get();
    const centerSize = config.translateHandleSize;
    if (!centerSize) {
      return;
    }
    const isMouseOver = this.mouseOverService.isMouseOverAdornerHandle(
      container,
      AdornerPointType.Translate
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
  showDebugPoints() {
    const ctx = this.ctx;
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
