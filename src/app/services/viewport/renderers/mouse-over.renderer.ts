import { Injectable } from "@angular/core";
import { BaseRenderer } from "./base.renderer";
import { consts } from "src/environments/consts";
import { AdornerData } from "../adorners/adorner-data";
import { TreeNode } from "src/app/models/tree-node";

/**
 * Mouse over renderer
 */
@Injectable({
  providedIn: "root",
})
export class MouseOverRenderer extends BaseRenderer {
  node: TreeNode;
  drawRect(
    ctx: CanvasRenderingContext2D,
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

  setMouseOver(node: TreeNode) {
    if (this.node !== node) {
      this.node = node;
      this.invalidate();
    }
  }
  redraw() {
    this.invalidated = false;
    /*this.clearBackground(ctx);
    if (this.node && this.node.mouseOver && !this.node.selected) {
      const element = this.node.getElement()
      let adornerData = this.adornersDataService.getElementAdornerData(element);
      // Convert element position on zoomed parent and then to a canvas coordites.
      const ctm = parentCTM.multiply(element.getScreenCTM());
      adornerData = adornerData.getTransformed(ctm);

      const thikness = consts.adorners.mouseOverBorderThikness * this.onePixel;
      this.drawRect(ctx, parentCTM, element, thikness, adornerData);
    }*/
  }
}
