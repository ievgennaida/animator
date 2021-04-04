import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import {
  PropertiesService,
  TransformPropertyKey,
} from "src/app/services/properties.service";
import { DecomposedMatrix } from "../../../../models/decompose-matrix";
import { MatrixUtils } from "../../../utils/matrix-utils";
import { Utils } from "../../../utils/utils";
import { BaseTransformAction } from "../base-transform-action";
import { TransformationModeIcon } from "../../../../models/transformation-mode";
import { LoggerService } from "src/app/services/logger.service";

@Injectable({
  providedIn: "root",
})
export class MatrixRotateAction extends BaseTransformAction {
  title = "Rotate";
  icon = TransformationModeIcon.rotate;

  /**
   * Start click position in anchor coordinates.
   */
  start: DOMPoint | null = null;
  transformOrigin: DOMPoint | null = null;
  node: TreeNode | null = null;
  startAngle = 0;
  changed = false;
  constructor(
    propertiesService: PropertiesService,
    private logger: LoggerService
  ) {
    super(propertiesService);
  }
  init(
    node: TreeNode,
    screenPos: DOMPoint | null = null,
    handle: HandleData | null = null
  ) {
    this.node = node;
    this.handle = handle;
    const element = this.node.getElement();

    this.transformOrigin = Utils.toElementPoint(
      node,
      this.getScreenTransformOrigin()
    );
    const screenTransformOrigin = Utils.toScreenPoint(
      element,
      this.transformOrigin
    );
    if (!screenTransformOrigin || !screenPos) {
      this.logger.log("Cannot transform transform origin to screen origin.");
      return;
    }
    this.startAngle = -Utils.angle(screenTransformOrigin, screenPos);

    // Get current transform matrix
    const matrix = MatrixUtils.getMatrix(element);

    if (matrix) {
      const decomposed = DecomposedMatrix.decomposeMatrix(matrix);
      this.startAngle -= decomposed.rotateZ;
    }
  }

  transformByMouse(screenPos: DOMPoint): boolean {
    const element = this.node?.getElement();
    if (
      !this.node ||
      !element ||
      !element.ownerSVGElement ||
      !this.transformOrigin
    ) {
      this.logger.log(
        "Element cannot be transformed. Should be initialized first"
      );
      return false;
    }
    const screenTransformOrigin = Utils.toScreenPoint(
      element,
      this.transformOrigin
    );
    if (!screenTransformOrigin) {
      this.logger.log("Cannot transform transform origin to screen origin.");
      return false;
    }
    let angle = -Utils.angle(screenTransformOrigin, screenPos);

    angle -= this.startAngle;

    return this.rotate(angle, this.transformOrigin);
  }

  /**
   * Set direct angle value.
   *
   * @param angle rotation angle.
   * @param transformPoint transform center.
   */
  rotate(angle: number, transformPoint: DOMPoint): boolean {
    const element = this.node?.getElement();
    if (!this.node || !element || !element.ownerSVGElement) {
      this.logger.log(
        "Element cannot be transformed. Should be initialized first"
      );
      return false;
    }

    const transform = Utils.getElementTransform(element);
    if (this.initialValues.size === 0) {
      this.saveInitialValues([this.node], [TransformPropertyKey]);
    }
    transformPoint = transformPoint.matrixTransform(transform.matrix);
    const currentAngle = DecomposedMatrix.decomposeMatrix(transform.matrix)
      .rotateZ;

    const offset = -(currentAngle - angle);
    const matrix = element.ownerSVGElement
      .createSVGMatrix()
      .translate(transformPoint.x, transformPoint.y)
      .rotate(offset, 0)
      .translate(-transformPoint.x, -transformPoint.y)
      .multiply(transform.matrix);

    this.propertiesService.setMatrixTransform(this.node, matrix);
    return true;
  }
}
