import { Injectable, NgZone } from "@angular/core";
import { LoggerService } from "../../logger.service";
import { OutlineService } from "../../outline.service";
import { TreeNode } from "src/app/models/tree-node";
import { ViewportService } from "../viewport.service";
import { BaseRenderer } from "./base.renderer";
import { consts } from "src/environments/consts";

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
    renderable: SVGGraphicsElement,
    thikness: number
  ) {
    const bounds = renderable.getBBox();
    const currentCTM = renderable.getScreenCTM();
    // Convert element position on zoomed parent and then to a canvas coordites.
    const ctm = this.canvasCTM.multiply(parentCTM.multiply(currentCTM));
    // ctx.setTransform(ctm);
    ctx.beginPath();
    ctx.lineWidth = thikness;
    ctx.strokeStyle = consts.adorners.mouseOverBoundsColor;
    let p = ctm.transformPoint(new DOMPoint(bounds.x, bounds.y));
    p = this.getSharpPos(p);
    ctx.moveTo(p.x, p.y);
    p = ctm.transformPoint(new DOMPoint(bounds.x + bounds.width, bounds.y));
    p = this.getSharpPos(p);
    ctx.lineTo(p.x, p.y);
    p = ctm.transformPoint(
      new DOMPoint(bounds.x + bounds.width, bounds.y + bounds.height)
    );
    p = this.getSharpPos(p);
    ctx.lineTo(p.x, p.y);

    p = ctm.transformPoint(new DOMPoint(bounds.x, bounds.y + bounds.height));
    p = this.getSharpPos(p);
    ctx.lineTo(p.x, p.y);

    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
  redraw(ctx: CanvasRenderingContext2D) {
    const parent = this.viewportService.viewport
      .ownerSVGElement as SVGSVGElement;
    const parentCTM = parent.getScreenCTM().inverse();
    if (this.renderableElements && this.renderableElements.length > 0) {
      this.renderableElements.forEach((node: TreeNode) => {
        if (!node.tag) {
          return;
        }
        let renderable = node.tag as SVGGraphicsElement;
        if (renderable && !(renderable instanceof SVGGraphicsElement)) {
          renderable = node.tag.layerElement as SVGGraphicsElement;
        }
        if (
          renderable &&
          renderable instanceof SVGGraphicsElement &&
          (node.mouseOver || node.selected)
        ) {
          let thikness = this.onePixel;
          if (node.mouseOver) {
            thikness = 2;
          }

          this.drawRect(ctx, parentCTM, renderable, thikness);
        }
      });
    }
  }
}
