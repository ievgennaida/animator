import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { PropertiesService } from "src/app/services/properties.service";
import { Utils } from "../../../utils/utils";
import { BaseTransformAction } from "../base-transform-action";
import { MatrixUtils } from "../matrix-utils";

@Injectable({
  providedIn: "root",
})
export class MatrixSkewAction extends BaseTransformAction {
  constructor(propertiesService: PropertiesService) {
    super(propertiesService);
  }
  /**
   * Start click position in anchor coordinates.
   */
  start: DOMPoint = null;
  /**
   * Skew mode, vertical or horizontal.
   */
  vertical = true;
  /**
   * Transformation coordinates anchor.
   */
  anchor: SVGGraphicsElement = null;

  initTransformMatrix: DOMMatrix = null;
  startOffset = 0;
  node: TreeNode = null;

  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData) {
    const element = node.getElement();
    this.vertical = true;
    const centerBox = Utils.getCenterTransform(element);
    this.start = centerBox;
    const transformedCenter = Utils.toScreenPoint(element, centerBox);
    this.startOffset = this.vertical
      ? transformedCenter.x - screenPos.x
      : transformedCenter.y - screenPos.y;
  }

  transformByMouse(screenPos: DOMPoint): boolean {
    const transformedCenter = new DOMPoint(
      this.vertical ? screenPos.x + this.startOffset : this.start.x,
      this.vertical ? this.start.y : screenPos.y + this.startOffset
    );

    let deg = -Utils.angle(transformedCenter, screenPos);
    if (!this.vertical) {
      deg = -deg - 90;
    }

    this.start = new DOMPoint(screenPos.x, screenPos.y);
    return this.skewOffset(deg, this.vertical);
  }

  skewOffset(deg: number, vertical: boolean): boolean {
    const element = this.node.getElement();
    this.saveInitialValue();
    const transform = Utils.getElementTransform(element);
    const centerBox = MatrixUtils.getTransformOrigin(element).matrixTransform(
      transform.matrix
    );
    let matrix = element.ownerSVGElement
      .createSVGMatrix()
      .translate(centerBox.x, centerBox.y);

    if (vertical) {
      matrix = matrix.skewY(deg);
    } else {
      matrix = matrix.skewX(deg);
    }

    matrix = matrix
      .translate(-centerBox.x, -centerBox.y)
      .multiply(transform.matrix);

    transform.setMatrix(matrix);
    element.transform.baseVal.initialize(transform);
    return true;
  }
}
