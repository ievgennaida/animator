// tslint:disable: variable-name
import { Injectable } from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { consts } from "src/environments/consts";
import { LoggerService } from "../../logger.service";
import { MouseOverService } from "../../mouse-over.service";
import { OutlineService } from "../../outline.service";
import { SelectionService } from "../../selection.service";
import { Utils } from "../../utils/utils";
import { AdornerData } from "../adorners/adorner-data";
import { AdornerType } from "../adorners/adorner-type";
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
    private selectionService: SelectionService,
    private mouseOverService: MouseOverService
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
  private _drawNodeHandles = true;
  get drawNodeHandles(): boolean {
    return this._drawNodeHandles;
  }
  set drawNodeHandles(value: boolean) {
    if (this._drawNodeHandles !== value) {
      this._drawNodeHandles = value;
      this.invalidate();
    }
  }
  getAdornerStroke(adornerType: AdornerType): string {
    if (
      this.selectionService.isAdornerHandleSelected(adornerType) ||
      // TODO: check adorner type.
      this.mouseOverService.isMouseOverAdornerHandle(adornerType)
    ) {
      return consts.handleSelectedFillColor;
    }

    return consts.handleFillColor;
  }

  drawAdornersHandles(ctx: CanvasRenderingContext2D, adornerData: AdornerData) {
    const alongH = Utils.getVector(
      adornerData.topLeft,
      adornerData.topRight,
      true
    );
    const alongW = Utils.getVector(
      adornerData.topLeft,
      adornerData.bottomLeft,
      true
    );
    const alongHR = Utils.reverseVector(alongH);
    const alongWR = Utils.reverseVector(alongW);
    const handleStroke = consts.handleStrokeColor;

    // top left
    this.drawAdornerHandle(
      ctx,
      adornerData.topLeft,
      alongW,
      alongH,
      false,
      handleStroke,
      this.getAdornerStroke(AdornerType.TopLeft)
    );
    // top right
    this.drawAdornerHandle(
      ctx,
      adornerData.topRight,
      alongHR,
      alongW,
      false,
      handleStroke,
      this.getAdornerStroke(AdornerType.TopRight)
    );
    // bottom left
    this.drawAdornerHandle(
      ctx,
      adornerData.bottomLeft,
      alongWR,
      alongH,
      false,
      handleStroke,
      this.getAdornerStroke(AdornerType.BottomLeft)
    );
    // bottom right
    this.drawAdornerHandle(
      ctx,
      adornerData.bottomRight,
      alongWR,
      alongHR,
      false,
      handleStroke,
      this.getAdornerStroke(AdornerType.BottomRight)
    );

    // top center
    this.drawAdornerHandle(
      ctx,
      adornerData.topCenter,
      alongW,
      alongH,
      true,
      handleStroke,
      this.getAdornerStroke(AdornerType.TopCenter)
    );
    // bottom center
    this.drawAdornerHandle(
      ctx,
      adornerData.bottomCenter,
      alongWR,
      alongH,
      true,
      handleStroke,
      this.getAdornerStroke(AdornerType.BottomCenter)
    );
    // left center
    this.drawAdornerHandle(
      ctx,
      adornerData.leftCenter,
      alongH,
      alongW,
      true,
      handleStroke,
      this.getAdornerStroke(AdornerType.LeftCenter)
    );
    // right center
    this.drawAdornerHandle(
      ctx,
      adornerData.rightCenter,
      alongHR,
      alongW,
      true,
      handleStroke,
      this.getAdornerStroke(AdornerType.RightCenter)
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
  isShowHandles(aboutToBeRendered: TreeNode[] = null) {
    if (!this.drawNodeHandles) {
      return false;
    }
    const renderable = aboutToBeRendered || this.getRenderable();
    const multiple = !!renderable && renderable.length > 1;
    return !multiple;
  }

  getRenderable(): TreeNode[] {
    const nodes = this.selectionService.getSelected();
    if (nodes && nodes.length > 0) {
      const renderable = nodes.filter((node) => !!node.getElement());
      return renderable;
    }

    return [];
  }
  redraw() {
    if (!this.ctx) {
      return;
    }
    const ctx = this.ctx;
    this.invalidated = false;
    this.clear();
    const renderable = this.getRenderable();

    const multiple = renderable.length > 1;

    const elementsColor =
      multiple || this.suppressMainSelection
        ? consts.altSelectionStroke
        : consts.mainSelectionStroke;
    const elementsThickness =
      multiple || this.suppressMainSelection
        ? consts.altSelectionThickness
        : consts.mainSelectionThickness;
    const drawSmallBounds = renderable.length <= consts.maxBoundsToRender;
    renderable.forEach((node: TreeNode) => {
      if (node.selected) {
        const adornerData = node.getScreenAdorners(this.screenCTM);
        if (adornerData) {
          if (drawSmallBounds) {
            this.drawAdornerRect(
              ctx,
              elementsThickness,
              elementsColor,
              adornerData
            );
          }
          if (!multiple && drawSmallBounds) {
            // draw when resized.
            // this.drawTextOnLine(ctx, "200px", adornerData.topLeft, adornerData.topRight, adornerData.bottomLeft);
            // this.drawTextOnLine(ctx, "100px", adornerData.topRight, adornerData.bottomRight, adornerData.topLeft);
            if (node.allowResize && this.drawNodeHandles) {
              this.drawAdornersHandles(ctx, adornerData);
              this.drawCross(ctx, adornerData.centerTransform);
            }
          }
        }
      }
    });

    // Draw global bounds:
    if (renderable && renderable.length > 1 && !this.suppressMainSelection) {
      // TODO: cached, reuse
      const adorners = renderable.map((p) =>
        p.getScreenAdorners(this.screenCTM)
      );

      const bounds = Utils.getBBoxBounds(...adorners);
      this.drawRect(
        ctx,
        consts.mainSelectionThickness,
        consts.mainSelectionStroke,
        null,
        bounds
      );
      // let totalBounds = Utils.getBBoxBounds(...renderable);
      // this.drawAdornerRect(ctx, consts.mainSelectionThickness, consts.mainSelectionStroke, adornerData);
      // this.adornersDataService.getElementAdornerData(null,totalBounds);
    }
    if (renderable && renderable.length >= 1) {
      // Path data, selected items bounds
      let selectedPointsBounds = this.selectionService.pathDataSubject.bounds;
      if (selectedPointsBounds) {
        // TODO: each point should be transformed according to the node transformation.
        selectedPointsBounds = renderable[0].adornerToScreen(
          selectedPointsBounds,
          this.screenCTM
        );

        this.drawAdornerRect(
          ctx,
          elementsThickness,
          elementsColor,
          selectedPointsBounds
        );
        if (this.drawPathDataPointsHandle) {
          this.drawAdornersHandles(ctx, selectedPointsBounds);
          this.drawCross(ctx, selectedPointsBounds.centerTransform);
        }
      }
    }
  }
}
