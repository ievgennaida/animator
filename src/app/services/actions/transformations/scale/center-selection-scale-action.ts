import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { Utils } from "src/app/services/utils/utils";
import { ViewService } from "src/app/services/view.service";
import { AdornerType } from "src/app/services/viewport/adorners/adorner-type";
import { PropertiesService } from "../../../properties.service";
import { TransformationModeIcon } from "../transformation-mode";
import { MatrixScaleAction } from "./matrix-scale-action";

/**
 * Scale rect transformation origin point when virtual selector rectangle scaling is applied.
 */
@Injectable({
  providedIn: "root",
})
export class CenterSelectionScaleAction extends MatrixScaleAction {
  constructor(propertiesService: PropertiesService, viewService: ViewService) {
    super(propertiesService, viewService);
  }
  title = "Center Transform";
  icon = TransformationModeIcon.Scale;
  changed = false;

  /**
   * Original value for the undo service
   */
  transformOriginInitial: DOMPoint | null = null;
  committedOrigin: DOMPoint | null = null;
  committed = false;

  moveSelectionHandle = false;
  init(node: TreeNode, screenPos: DOMPoint | null, handle: HandleData | null) {
    this.node = node;
    this.handle = handle;
    this.moveSelectionHandle =
      this.handle?.adorner?.type === AdornerType.Selection;
    // this.getScreenTransformOrigin();

    this.transformOriginInitial = this.handle?.adorner?.element?.centerTransform;
    super.init(node, screenPos, handle);
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
  /**
   * Scale element by a matrix in screen coordinates and convert it back to the element coordinates.
   * Usage: element is transformed by itself, you can compose screen matrix and apply it to the element directly.
   * @param screenScaleMatrix screen coordinates matrix.
   */
  scaleByScreenMatrix(screenScaleMatrix: DOMMatrix): boolean {
    if (this.moveSelectionHandle && this.transformOriginInitial) {
      // Apply transformation in screen coordinates:
      this.committedOrigin = Utils.toScreenPoint(
        this.node,
        this.transformOriginInitial
      ).matrixTransform(screenScaleMatrix);
      this.committedOrigin = Utils.toElementPoint(
        this.node,
        this.committedOrigin
      );
      this.handle?.adorner?.setCenterTransform(this.committedOrigin);
      return true;
    }
    return false;
  }
}