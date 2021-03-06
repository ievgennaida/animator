import { Injectable } from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { consts } from "src/environments/consts";
import { AdornersService } from "../adorners-service";
import { MouseOverService } from "../mouse-over.service";
import { BaseRenderer } from "./base.renderer";

/**
 * Mouse over renderer
 */
@Injectable({
  providedIn: "root",
})
export class MouseOverRenderer extends BaseRenderer {
  /**
   * Draw path outline on mouse over when possible.
   */
  enableDrawPathOutline = false;
  node: TreeNode | null = null;
  constructor(
    private mouseOverService: MouseOverService,
    private adornersService: AdornersService
  ) {
    super();
  }
  setMouseOver(node: TreeNode): void {
    if (this.node !== node) {
      this.node = node;
      this.invalidate();
    }
  }
  redraw(): void {
    if (!this.ctx) {
      return;
    }
    this.invalidated = false;
    this.clear();
    if (
      this.node &&
      this.node.mouseOver &&
      // Selected adorners are displayed with the separate renderer.
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
        const adorner = this.adornersService.getAdorner(this.node)?.screen;
        if (adorner) {
          const screenAdorner = adorner.matrixTransform(this.screenCTM);
          const thickness = consts.mouseOverBorderThickness * this.onePixel;
          this.drawAdornerRect(
            this.ctx,
            thickness,
            consts.mouseOverBoundsColor,
            screenAdorner
          );
        }
      }
    }
  }
}
