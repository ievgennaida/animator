import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { PropertiesService } from "../../../properties.service";
import { Utils } from "../../../utils/utils";
import { BaseTransformAction } from "../base-transform-action";
import { TransformationModeIcon } from "../transformation-mode";

/**
 * Rect translate by the mouse action.
 */
@Injectable({
  providedIn: "root",
})
export class RectTranslateAction extends BaseTransformAction {
  constructor(propertiesService: PropertiesService) {
    super(propertiesService);
  }
  title = "Move";
  icon = TransformationModeIcon.Move;
  propX = "x";
  propY = "y";
  changed = false;
  startRect: DOMRect = null;
  /**
   * Start mouse click position in element coordinates.
   */
  start: DOMPoint = null;

  committed = false;

  init(node: TreeNode, screenPos: DOMPoint | null, handle: HandleData | null) {
    this.node = node;
    // Store mouse position
    if (screenPos) {
      this.start = Utils.toElementPoint(
        node.getElement(),
        screenPos as DOMPoint
      );
      const bbox = this.node.getBBox();
      this.start.x -= bbox.x;
      this.start.y -= bbox.y;
    }
    this.committed = false;
  }

  transformByMouse(screenPos: DOMPoint): boolean {
    if (!screenPos || !this.start) {
      return false;
    }

    const element = this.node.getElement();

    const offset = Utils.toElementPoint(element, screenPos);
    if (!offset) {
      return false;
    }
    offset.x -= this.start.x;
    offset.y -= this.start.y;
    const isTranslated = this.translate(offset.x, offset.y);
    return isTranslated;
  }

  /**
   * Translate
   */
  translate(x: number | null = null, y: number | null = null): boolean {
    if (this.initialValues.size === 0) {
      this.saveInitialValues([this.node], [this.propX, this.propY]);
    }
    if (x !== null) {
      this.propertiesService.setNum(this.node, this.propX, x);
    }
    if (y !== null) {
      this.propertiesService.setNum(this.node, this.propY, y);
    }
    const isChanged = !!(x || y);
    return isChanged;
  }
}
