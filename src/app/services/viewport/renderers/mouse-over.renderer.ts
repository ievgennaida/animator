import { Injectable } from "@angular/core";
import { BaseRenderer } from "./base.renderer";
import { consts } from "src/environments/consts";
import { AdornerData } from "../adorners/adorner-data";
import { TreeNode } from "src/app/models/tree-node";
import { AdornersDataService } from "../adorners/adorners-data.service";

/**
 * Mouse over renderer
 */
@Injectable({
  providedIn: "root",
})
export class MouseOverRenderer extends BaseRenderer {
  constructor(private adornersDataService: AdornersDataService) {
    super();
  }
  node: TreeNode;
  setMouseOver(node: TreeNode) {
    if (this.node !== node) {
      this.node = node;
      this.invalidate();
    }
  }
  redraw() {
    this.invalidated = false;
    this.clear();
    if (this.node && this.node.mouseOver && !this.node.selected) {
      const element = this.node.getElement();
      if (!element) {
        return;
      }
      let adornerData = this.adornersDataService.getElementAdornerData(element);
      const ctm = this.screenCTM.multiply(element.getScreenCTM());
      // Convert element position on zoomed parent and then to a canvas coordites.
      adornerData = adornerData.getTransformed(ctm);
      const thikness = consts.adorners.mouseOverBorderThikness * this.onePixel;
      this.drawAdornerRect(this.ctx, thikness, adornerData);
    }
  }
}
