import { Injectable } from "@angular/core";
import { BaseRenderer } from "./base.renderer";
import { consts } from "src/environments/consts";
import { TreeNode } from "src/app/models/tree-node";
import { MouseOverService } from "../../mouse-over.service";

/**
 * Mouse over renderer
 */
@Injectable({
  providedIn: "root",
})
export class MouseOverRenderer extends BaseRenderer {
  constructor(private mouseOverService: MouseOverService) {
    super();
  }
  /**
   * Draw path outline on mouse over when possible.
   */
  enableDrawPathOutline = false;
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
    if (
      this.node &&
      this.node.mouseOver &&
      !this.node.selected &&
      !this.mouseOverService.isMouseOverAdornerHandle()
    ) {
      const element = this.node.getElement();
      if (!element || !element.getScreenCTM) {
        return;
      }

      let outlineRendered = false;
      if (this.enableDrawPathOutline) {
        outlineRendered = this.drawPathOutline(
          this.node,
          consts.mouseOverBoundsColor
        );
        // Draw bounds in any case.
        outlineRendered = false;
      }
      if (!outlineRendered) {
        const adornerData = this.node.getScreenAdorners(this.screenCTM);
        const thickness = consts.mouseOverBorderThickness * this.onePixel;
        this.drawAdornerRect(
          this.ctx,
          thickness,
          consts.mouseOverBoundsColor,
          adornerData
        );
      }
    }
  }
}
