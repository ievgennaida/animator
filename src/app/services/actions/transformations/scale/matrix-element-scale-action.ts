import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import {
  PropertiesService,
  TransformPropertyKey,
} from "src/app/services/properties.service";
import { MatrixUtils } from "../../../utils/matrix-utils";
import { Utils } from "../../../utils/utils";
import {
  AdornerPointType,
  AdornerTypeUtils,
} from "../../../viewport/adorners/adorner-type";
import { BaseTransformAction } from "../base-transform-action";
import { TransformationModeIcon } from "../transformation-mode";

/**
 * Transform element in element coordinates.
 */
@Injectable({
  providedIn: "root",
})
export class MatrixElementScaleAction extends BaseTransformAction {
  constructor(propertiesService: PropertiesService) {
    super(propertiesService);
  }
  title = "Scale";
  icon = TransformationModeIcon.Scale;
  /**
   * Start click position in anchor coordinates.
   */
  start: DOMPoint = null;
  initBBox: DOMRect = null;
  transformOrigin: DOMPoint = null;

  initTransformMatrix: DOMMatrix = null;
  attributesToStore = [TransformPropertyKey];

  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData) {
    this.handle = handle;
    this.start = screenPos;
    this.node = node;

    const element = node.getElement();
    this.initBBox = this.node.getBBox();

    this.start = Utils.toElementPoint(element, screenPos);
    // Opposite point = transform origin
    this.transformOrigin = AdornerTypeUtils.getAdornerPosition(
      this.initBBox,
      AdornerTypeUtils.getOpposite(this.handle.handle)
    );
  }

  transformByMouse(screenPos: DOMPoint): boolean {
    return this.scaleElementByMouse(screenPos);
  }

  /**
   * Scaling in element coordinates.
   * Allow to keep proportions of element and scale proportionally transformed element.
   */
  scaleElementByMouse(screenPos: DOMPoint): boolean {
    if (
      !screenPos ||
      !this.initBBox ||
      this.initBBox.height === 0 ||
      this.initBBox.width === 0
    ) {
      return false;
    }
    const element = this.node.getElement();
    let offset = screenPos;
    offset = Utils.toElementPoint(element, screenPos);

    const handle = this.handle.handle;
    const newWidth = this.transformOrigin.x - offset.x;
    const newHeight = this.transformOrigin.y - offset.y;

    let scaleY = newHeight / this.initBBox.height;
    let scaleX = newWidth / this.initBBox.width;
    scaleY = (this.transformOrigin.y <= this.initBBox.y ? -1 : 1) * scaleY;
    scaleX = (this.transformOrigin.x <= this.initBBox.x ? -1 : 1) * scaleX;
    if (
      handle === AdornerPointType.TopCenter ||
      handle === AdornerPointType.BottomCenter
    ) {
      scaleX = null;
    } else if (
      handle === AdornerPointType.RightCenter ||
      handle === AdornerPointType.LeftCenter
    ) {
      scaleY = null;
    }

    return this.scaleOffset(scaleX, scaleY, this.transformOrigin);
  }

  /**
   * Scale element by a matrix in screen coordinates and convert it back to the element coordinates.
   * Usage: element is transformed by itself, you can compose screen matrix and apply it to the element directly.
   * @param screenScaleMatrix screen coordinates matrix.
   */
  scaleByScreenMatrix(screenScaleMatrix: DOMMatrix): boolean {
    const element = this.node.getElement();
    const parent = element.parentNode as SVGGraphicsElement;
    // Get original to screen matrix from which transformation was started (anchor for when screen coords are changed on pan)
    const toScreenMatrix = parent
      .getScreenCTM()
      .multiply(this.initTransformMatrix);

    const newTransformationMatrix = MatrixUtils.convertScreenMatrixToElementMatrix(
      screenScaleMatrix,
      toScreenMatrix,
      // Only when transformed element is used
      this.initTransformMatrix
    );

    // Apply new created transform back to the element:
    return this.applyMatrix(newTransformationMatrix);
  }

  scaleOffset(
    offsetX: number | null,
    offsetY: number | null,
    transformPoint: DOMPoint
  ): boolean {
    offsetY = MatrixUtils.normalizeScale(offsetY);
    offsetX = MatrixUtils.normalizeScale(offsetX);
    const element = this.node.getElement();

    const matrix = MatrixUtils.generateScaleMatrix(
      element,
      offsetX,
      offsetY,
      transformPoint
    );
    return this.applyMatrix(matrix);
  }

  /**
   * Apply transformation by matrix.
   */
  applyMatrix(matrix: DOMMatrix): boolean {
    this.saveInitialValue();
    const element = this.node.getElement();
    const transform = Utils.getElementTransform(element);
    matrix = transform.matrix.multiply(matrix);
    return this.propertiesService.setMatrixTransform(this.node, matrix);
  }
}
