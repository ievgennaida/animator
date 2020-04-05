import { Injectable } from "@angular/core";
import { BaseRenderer } from "./base.renderer";
import { consts } from "src/environments/consts";
import { TreeNode } from "src/app/models/tree-node";

/**
 * Mouse over renderer
 */
@Injectable({
  providedIn: "root",
})
export class MouseOverRenderer extends BaseRenderer {
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
      if (!element || !element.getScreenCTM) {
        return;
      }

      const adornerData = this.node.getScreenAdorners(this.screenCTM);
      const thikness = consts.adorners.mouseOverBorderThikness * this.onePixel;
      this.drawAdornerRect(this.ctx, thikness, adornerData);
    }
  }
}
