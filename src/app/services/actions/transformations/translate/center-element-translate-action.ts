import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { LoggerService } from "src/app/services/logger.service";
import { TransformationModeIcon } from "../../../../models/transformation-mode";
import {
  CenterTransformX,
  CenterTransformY,
  PropertiesService,
} from "../../../properties.service";
import { Utils } from "../../../utils/utils";
import { BaseTransformAction } from "../base-transform-action";

/**
 * Translate center transformation point for the DOM element and store as custom attribute.
 */
@Injectable({
  providedIn: "root",
})
export class CenterElementTranslateAction extends BaseTransformAction {
  title = "Center Transform";
  icon = TransformationModeIcon.move;

  /**
   * Start mouse click position in element coordinates.
   */
  offset: DOMPoint | null = null;
  committed = false;
  moveSelectionHandle = false;
  constructor(
    propertiesService: PropertiesService,
    private logger: LoggerService
  ) {
    super(propertiesService);
  }
  init(node: TreeNode, screenPos: DOMPoint | null, handle: HandleData | null) {
    this.node = node;
    this.handle = handle;

    this.offset = new DOMPoint(0, 0);
    // Store mouse position
    if (screenPos && node) {
      const centerTransform = this.propertiesService.getCenterTransform(
        this.node,
        false
      );

      const elementStartPos = Utils.toElementPoint(node, screenPos as DOMPoint);

      if (centerTransform && elementStartPos) {
        this.offset.x = elementStartPos.x - centerTransform.x;
        this.offset.y = elementStartPos.y - centerTransform.y;
      }
    }
    this.committed = false;
  }

  transformByMouse(screenPos: DOMPoint): boolean {
    if (!screenPos || !this.node || !this.offset) {
      this.logger.warn(
        "Element cannot be moved. Action should be initialized first"
      );
      return false;
    }

    const element = this.node.getElement();

    const clickPosition = Utils.toElementPoint(element, screenPos);
    if (!clickPosition) {
      return false;
    }

    const isTranslated = this.translate(
      clickPosition.x - this.offset.x,
      clickPosition.y - this.offset.y
    );
    return isTranslated;
  }

  /**
   * Translate
   */
  translate(x: number | null = null, y: number | null = null): boolean {
    if (!this.node) {
      this.logger.warn(
        "Element cannot be moved. Action should be initialized first"
      );
      return false;
    }
    if (this.initialValues.size === 0) {
      this.saveInitialValues([this.node], [CenterTransformX, CenterTransformY]);
    }
    this.handle?.adorner?.setCenterTransform(new DOMPoint(x || 0, y || 0));
    // make it relative to the element pos:
    const bbox = this.node?.getBBox();
    if (!bbox) {
      this.logger.warn("Transformation cannot be done, bbox cannot be found");
      return false;
    }

    if (x !== null) {
      x -= bbox.x;
    }
    if (y !== null) {
      y -= bbox.y;
    }
    return this.propertiesService.setCenterTransform(this.node, x, y);
  }
}
