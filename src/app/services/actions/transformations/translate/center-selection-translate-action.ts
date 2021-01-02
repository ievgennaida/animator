import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { OutlineService } from "src/app/services/outline.service";
import { Utils } from "src/app/services/utils/utils";
import { PropertiesService } from "../../../properties.service";
import { BaseTransformAction } from "../base-transform-action";
import { TransformationModeIcon } from "../transformation-mode";

/**
 * Translate center transformation point for the virtual selection rectangle.
 * (store only in memory until next rect is applied)
 */
@Injectable({
  providedIn: "root",
})
export class CenterSelectionTranslateAction extends BaseTransformAction {
  constructor(
    propertiesService: PropertiesService,
    private outlineService: OutlineService
  ) {
    super(propertiesService);
  }
  title = "Center Transform";
  changed = false;
  icon = TransformationModeIcon.Move;
  /**
   * Original value for the undo service
   */
  transformOriginInitial: DOMPoint | null = null;
  /**
   * Start mouse click position in element coordinates.
   */
  offset: DOMPoint | null = null;
  transformOrigin: DOMPoint | null = null;
  committedOrigin: DOMPoint | null = null;
  committed = false;
  anchor: TreeNode | null = null;
  init(node: TreeNode, screenPos: DOMPoint | null, handle: HandleData | null) {
    this.node = node;
    this.handle = handle;
    this.anchor = this.outlineService.rootNode;
    this.transformOrigin = Utils.toElementPoint(
      this.anchor,
      super.getScreenTransformOrigin()
    );

    this.offset = new DOMPoint(0, 0);
    this.transformOriginInitial = this.handle?.adorner?.element?.centerTransform;
    // Determine initial offset:
    const elementStartPos = Utils.toElementPoint(this.anchor, screenPos);
    if (this.transformOrigin) {
      this.offset.x = elementStartPos.x - this.transformOrigin.x;
      this.offset.y = elementStartPos.y - this.transformOrigin.y;
    }
    this.committed = false;
  }
  execute() {
    if (!this.committed) {
      throw new Error("Cannot execute uncommitted value");
    }
    if (this.committedOrigin) {
      this.handle?.adorner?.setCenterTransform(this.committedOrigin);
    }
  }
  undo() {
    // Can be null, means that was unset (default)
    this.handle?.adorner?.setCenterTransform(this.transformOriginInitial);
  }
  transformByMouse(screenPos: DOMPoint): boolean {
    if (screenPos && this.transformOrigin) {
      const clickPosition = Utils.toElementPoint(this.anchor, screenPos);
      this.committedOrigin = new DOMPoint(
        clickPosition.x - this.offset.x,
        clickPosition.y - this.offset.y
      );
      this.handle?.adorner?.setCenterTransform(this.committedOrigin);
      return true;
    }
    return false;
  }
}
