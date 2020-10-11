// tslint:disable: variable-name
import { Injectable } from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { consts } from "src/environments/consts";
import { LoggerService } from "../../logger.service";
import { MouseOverService } from "../../mouse-over.service";
import { OutlineService } from "../../outline.service";
import { SelectionService } from "../../selection.service";
import { Utils } from "../../utils/utils";
import { Adorner } from "../adorners/adorner";
import { AdornerType } from "../adorners/adorner-type";
import { BaseRenderer } from "./base.renderer";
import { TransformsService } from "../transformations/transforms.service";

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
    private mouseOverService: MouseOverService,
    private transform: TransformsService
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
  getAdornerStroke(adorner: Adorner, adornerType: AdornerType): string {
    const isSelected = this.mouseOverService.isMouseOverAdornerHandle(
      adorner,
      adornerType
    );
    if (isSelected) {
      return consts.handleSelectedFillColor;
    }

    return consts.handleFillColor;
  }

  drawAdornersHandles(ctx: CanvasRenderingContext2D, adorner: Adorner) {
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
      this.getAdornerStroke(adorner, AdornerType.TopLeft)
    );
    // top right
    this.drawAdornerHandle(
      ctx,
      adorner.topRight,
      alongHR,
      alongW,
      false,
      handleStroke,
      this.getAdornerStroke(adorner, AdornerType.TopRight)
    );
    // bottom left
    this.drawAdornerHandle(
      ctx,
      adorner.bottomLeft,
      alongWR,
      alongH,
      false,
      handleStroke,
      this.getAdornerStroke(adorner, AdornerType.BottomLeft)
    );
    // bottom right
    this.drawAdornerHandle(
      ctx,
      adorner.bottomRight,
      alongWR,
      alongHR,
      false,
      handleStroke,
      this.getAdornerStroke(adorner, AdornerType.BottomRight)
    );

    // top center
    this.drawAdornerHandle(
      ctx,
      adorner.topCenter,
      alongW,
      alongH,
      true,
      handleStroke,
      this.getAdornerStroke(adorner, AdornerType.TopCenter)
    );
    // bottom center
    this.drawAdornerHandle(
      ctx,
      adorner.bottomCenter,
      alongWR,
      alongH,
      true,
      handleStroke,
      this.getAdornerStroke(adorner, AdornerType.BottomCenter)
    );
    // left center
    this.drawAdornerHandle(
      ctx,
      adorner.leftCenter,
      alongH,
      alongW,
      true,
      handleStroke,
      this.getAdornerStroke(adorner, AdornerType.LeftCenter)
    );
    // right center
    this.drawAdornerHandle(
      ctx,
      adorner.rightCenter,
      alongHR,
      alongW,
      true,
      handleStroke,
      this.getAdornerStroke(adorner, AdornerType.RightCenter)
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
    // TODO:
    return true;
    // const renderable = aboutToBeRendered || this.getRenderable();
    // const multiple = !!renderable && renderable.length > 1;
    // return !multiple;
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
    // TODO:
    const multiple = false;

    const elementsColor =
      multiple || this.suppressMainSelection
        ? consts.altSelectionStroke
        : consts.mainSelectionStroke;
    const elementsThickness =
      multiple || this.suppressMainSelection
        ? consts.altSelectionThickness
        : consts.mainSelectionThickness;
    const drawSmallBounds = true;
    const adorners = this.selectionService.getActiveAdorners();

    adorners.forEach((adorner) => {
      if (adorner) {
        adorner = adorner.toScreen().matrixTransform(this.screenCTM);
        if (drawSmallBounds) {
          this.drawAdornerRect(ctx, elementsThickness, elementsColor, adorner);
        }
        // if (adorner.node) {
        // if (!multiple && drawSmallBounds) {
        // draw when resized.
        // this.drawTextOnLine(ctx, "200px", Adorner.topLeft, Adorner.topRight, Adorner.bottomLeft);
        // this.drawTextOnLine(ctx, "100px", Adorner.topRight, Adorner.bottomRight, Adorner.topLeft);
        // if (node.allowResize && this.drawNodeHandles) {
        if (adorner.node) {
          this.drawAdornersHandles(ctx, adorner);
        }
        // this.drawCross(ctx, adorner.centerTransform);
        // }
        // }
        // }
      }
    });

    // Debug transform transactions.
    // TODO: this should become proper way to display transform origin during the running transaction.
    /*
    const trans = this.transform.transactions || [];
    trans.forEach((p) => {
      if (p.transformOrigin && p.handle.adorner) {
        let local = Utils.matrixRectTransform(
          p.node.getBBox(),
          p.node.getScreenCTM(),
          true
        );
        local = Utils.matrixRectTransform(
          p.node.getBBox(),
          p.node.getScreenCTM(),
          true
        );

        local = Utils.matrixRectTransform(
          p.initBBox,
          p.node.getScreenCTM(),
          false
        );

        local = Utils.matrixRectTransform(local, this.screenCTM);
        //this.drawRect(this.ctx, local);
        this.drawAdornerRect(this.ctx, 1, "black", p.startAdorner);
        this.drawAdornerRect(this.ctx, 1, "blue", p.testAdorner);
        this.drawAdornerRect(this.ctx, 2, "green", p.testAdorner2);
        //this.drawAdornerRect(this.ctx, 1, 'red', p.testAdorner);
        //const rect = Utils.matrixRectTransform(
        //  p.initBBox,
        //  // Utils.matrixRectTransform(p.initBBox, p.initMatrix.inverse(), true),
        //  this.screenCTM
        //);
        //this.drawRect(this.ctx, rect);
        // const scr = Utils.toScreenPoint(
        //   p.node,
        //   p.transformOrigin
        // ).matrixTransform(this.screenCTM);
        if (p && p.transformOrigin) {
          const scr = Utils.toScreenPoint(
            p.node,
            p.transformOrigin
          ).matrixTransform(this.screenCTM);
          this.drawCross(ctx, scr);
        }

        if (p.debugPoints) {
          p.debugPoints.forEach((point) => {
            if (point) {
              const test = Utils.toScreenPoint(p.node, point).matrixTransform(
                this.screenCTM
              );
              //this.drawCross(ctx, test);
            }
          });
        }
      }
    });  */
  }
}
