import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { OutlineService } from "src/app/services/outline.service";
import { Utils } from "src/app/services/utils/utils";
import { TransformationModeIcon } from "../../../../models/transformation-mode";
import { PropertiesService } from "../../../properties.service";
import { BaseTransformAction } from "../base-transform-action";

/**
 * Translate center transformation point for the virtual selection rectangle.
 * (store only in memory until next rect is applied)
 */
@Injectable({
  providedIn: "root",
})
export class CenterSelectionTranslateAction extends BaseTransformAction {
  title = "Center Transform";
  changed = false;
  icon = TransformationModeIcon.move;
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
  constructor(
    propertiesService: PropertiesService,
    private outlineService: OutlineService
  ) {
    super(propertiesService);
  }
  init(node: TreeNode, screenPos: DOMPoint | null, handle: HandleData | null) {
    this.node = node;
    this.handle = handle;
    this.anchor = this.outlineService.rootNode;
    this.transformOrigin = Utils.toElementPoint(
      this.anchor,
      super.getScreenTransformOrigin()
    );

    this.offset = new DOMPoint(0, 0);
    this.transformOriginInitial =
      this.handle?.adorner?.element?.centerTransform || null;
    // Determine initial offset:
    const elementStartPos = Utils.toElementPoint(this.anchor, screenPos);

    if (this.transformOrigin && elementStartPos) {
      this.offset.x = elementStartPos.x - this.transformOrigin.x;
      this.offset.y = elementStartPos.y - this.transformOrigin.y;
    }
    this.committed = false;
  }
  execute(): void {
    if (!this.committed) {
      throw new Error("Cannot execute uncommitted value");
    }
    if (this.committedOrigin) {
      this.handle?.adorner?.setCenterTransform(this.committedOrigin);
    }
  }
  undo(): void {
    // Can be null, means that was unset (default)
    this.handle?.adorner?.setCenterTransform(this.transformOriginInitial);
  }
  transformByMouse(screenPos: DOMPoint): boolean {
    if (screenPos && this.transformOrigin && this.offset) {
      const clickPosition = Utils.toElementPoint(this.anchor, screenPos);
      if (!clickPosition) {
        return false;
      }
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
