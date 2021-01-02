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
import { TransformationModeIcon } from "../transformation-mode";

@Injectable({
  providedIn: "root",
})
export class MatrixRotateAction extends BaseTransformAction {
  constructor(propertiesService: PropertiesService) {
    super(propertiesService);
  }

  title = "Rotate";
  icon = TransformationModeIcon.Rotate;

  /**
   * Start click position in anchor coordinates.
   */
  start: DOMPoint = null;
  transformOrigin: DOMPoint = null;
  node: TreeNode = null;
  startAngle = 0;
  changed = false;
  init(
    node: TreeNode,
    screenPos: DOMPoint | null = null,
    handle: HandleData | null = null
  ) {
    this.attributesToStore = [TransformPropertyKey];
    this.node = node;
    this.handle = handle;
    const element = this.node.getElement();

    this.transformOrigin = Utils.toElementPoint(
      node,
      this.getScreenTransformOrigin()
    );
    const transformedCenter = Utils.toScreenPoint(
      element,
      this.transformOrigin
    );
    this.startAngle = -Utils.angle(transformedCenter, screenPos);

    // Get current transform matrix
    const matrix = MatrixUtils.getMatrix(element);

    if (matrix) {
      const decomposed = DecomposedMatrix.decomposeMatrix(matrix);
      this.startAngle -= decomposed.rotateZ;
    }
  }

  transformByMouse(screenPos: DOMPoint): boolean {
    const transformPoint = this.transformOrigin;
    const element = this.node.getElement();
    const screenTransformOrigin = Utils.toScreenPoint(element, transformPoint);
    let angle = -Utils.angle(screenTransformOrigin, screenPos);

    angle -= this.startAngle;

    return this.rotate(angle, transformPoint);
  }

  /**
   * Set direct angle value.
   * @param angle rotation angle.
   * @param transformPoint transform center.
   */
  rotate(angle: number, transformPoint: DOMPoint): boolean {
    const element = this.node.getElement();

    const transform = Utils.getElementTransform(element);
    this.saveInitialValue();
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
