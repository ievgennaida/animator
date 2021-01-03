import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import {
  PropertiesService,
  TransformPropertyKey,
} from "src/app/services/properties.service";
import { AdornerPointType } from "src/app/services/viewport/adorners/adorner-type";
import { Utils } from "../../../utils/utils";
import { BaseTransformAction } from "../base-transform-action";

@Injectable({
  providedIn: "root",
})
export class MatrixSkewAction extends BaseTransformAction {
  constructor(propertiesService: PropertiesService) {
    super(propertiesService);
  }
  title = "Skew";
  /**
   * Start click position in anchor coordinates.
   */
  start: DOMPoint | null = null;
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
  centerTransform: DOMPoint | null = null;
  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData) {
    this.node = node;
    this.handle = handle;
    this.vertical = handle.handle === AdornerPointType.BottomLeft;
    const centerBox = this.propertiesService.getCenterTransform(node);

    const element = node.getElement();
    this.centerTransform = centerBox;
    this.start = Utils.toScreenPoint(element, centerBox);
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
    if (this.initialValues.size === 0) {
      this.saveInitialValues([this.node], [TransformPropertyKey]);
    }
    const transform = Utils.getElementTransform(element);

    const centerBox = this.centerTransform.matrixTransform(transform.matrix);
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

    this.propertiesService.setMatrixTransform(this.node, matrix);
    return true;
  }
}
