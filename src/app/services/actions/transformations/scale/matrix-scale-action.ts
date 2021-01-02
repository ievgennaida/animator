import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import {
  PropertiesService,
  TransformPropertyKey,
} from "src/app/services/properties.service";
import { ViewService } from "src/app/services/view.service";
import { DecomposedMatrix } from "../../../../models/decompose-matrix";
import { MatrixUtils } from "../../../utils/matrix-utils";
import { Utils } from "../../../utils/utils";
import {
  AdornerPointType,
  AdornerTypeUtils,
} from "../../../viewport/adorners/adorner-type";
import { BaseTransformAction } from "../base-transform-action";
import { TransformationModeIcon } from "../transformation-mode";

/**
 * Matrix scale in screen rectangle coordinates.
 */
@Injectable({
  providedIn: "root",
})
export class MatrixScaleAction extends BaseTransformAction {
  constructor(
    propertiesService: PropertiesService,
    protected viewService: ViewService
  ) {
    super(propertiesService);
  }
  title = "Scale";
  icon = TransformationModeIcon.Scale;
  /**
   * Start click position in anchor coordinates.
   */
  start: DOMPoint = null;
  initBBox: DOMRect = null;

  /**
   * Transformation coordinates anchor.
   */
  anchor: SVGGraphicsElement = null;
  transformOrigin: DOMPoint = null;

  initTransformMatrix: DOMMatrix = null;
  attributesToStore = [TransformPropertyKey];
  transformElementCoordinates = false;

  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData) {
    this.handle = handle;
    this.start = screenPos;
    this.node = node;

    this.anchor = this.viewService.viewport;

    this.initBBox = this.handle?.adorner?.screen?.getBBox();
    const toElementMatrix = this.anchor.getScreenCTM().inverse();
    // To viewport element coordinates:
    this.initBBox = MatrixUtils.matrixRectTransform(
      this.initBBox,
      toElementMatrix,
      false
    );

    const element = this.getElement();
    if (element) {
      this.initTransformMatrix = MatrixUtils.getMatrix(element);
    }
    this.start = Utils.toElementPoint(this.anchor, screenPos);

    // Opposite point = transform origin
    this.transformOrigin = AdornerTypeUtils.getAdornerPosition(
      this.initBBox,
      AdornerTypeUtils.getOpposite(this.handle.handle)
    );
  }
  getElement(): SVGGraphicsElement | null {
    if (!this.node) {
      return null;
    }
    return this.node.getElement();
  }

  transformByMouse(screenPos: DOMPoint): boolean {
    return this.scaleByMouse(screenPos);
  }

  /**
   * Scale in screen coordinates.
   * Used to scale groups and element by bounds adorners.
   * @param screenPos new screen position.
   */
  scaleByMouse(screenPos: DOMPoint): boolean {
    if (!screenPos || !this.start) {
      return false;
    }

    const offset = screenPos;
    // Anchor is used to avoid point mismatch when screen is scrolled or panned.
    // Position is not reliable when screen coordinates are used.
    const startScreen = Utils.toScreenPoint(this.anchor, this.start);
    const screenTransformOrigin = Utils.toScreenPoint(
      this.anchor,
      this.transformOrigin
    );

    // Handle can be clicked with some offset.
    // Calculate relative mouse new mouse position.
    const handle = this.handle.handle;
    const newWidth = screenTransformOrigin.x - offset.x;
    const newHeight = screenTransformOrigin.y - offset.y;
    const initialWidth = screenTransformOrigin.x - startScreen.x;
    const initialHeight = screenTransformOrigin.y - startScreen.y;
    let scaleY = newHeight / initialHeight;
    let scaleX = newWidth / initialWidth;

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
    scaleX = MatrixUtils.normalizeScale(scaleX);
    scaleY = MatrixUtils.normalizeScale(scaleY);
    // scale change in screen coordinates:
    const screenScaleMatrix = MatrixUtils.generateScaleMatrix(
      this.getElement() || this.anchor,
      scaleX,
      scaleY,
      screenTransformOrigin
    );
    this.debugPoints[0] = screenTransformOrigin;
    // this.debugPoints[0] = screenTransformOrigin;
    return this.scaleByScreenMatrix(screenScaleMatrix);
  }

  /**
   * Scale element by a matrix in screen coordinates and convert it back to the element coordinates.
   * Usage: element is transformed by itself, you can compose screen matrix and apply it to the element directly.
   * @param screenScaleMatrix screen coordinates matrix.
   */
  scaleByScreenMatrix(screenScaleMatrix: DOMMatrix): boolean {
    const element = this.getElement();
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

  /**
   * Apply transformation by matrix.
   */
  applyMatrix(matrix: DOMMatrix): boolean {
    this.saveInitialValue();
    return this.propertiesService.setMatrixTransform(this.node, matrix);
  }
  /**
   * Set direct scale value.
   */
  scale(scaleX: number, scaleY: number, transformPoint: DOMPoint): boolean {
    const element = this.node.getElement();

    const transform = Utils.getElementTransform(element);
    transformPoint = transformPoint.matrixTransform(transform.matrix);
    const decomposed = DecomposedMatrix.decomposeMatrix(transform.matrix);
    if (
      decomposed.rotateZ === -180 &&
      (decomposed.scaleX !== 1 || decomposed.scaleY !== 1)
    ) {
      decomposed.rotateZ = 0;
      decomposed.scaleX = -decomposed.scaleX;
      decomposed.scaleY = -decomposed.scaleY;
    }

    const offsetX = scaleX ? scaleX / decomposed.scaleX : 1;
    const offsetY = scaleY ? scaleY / decomposed.scaleY : 1;

    const svgTransform = element.ownerSVGElement.createSVGTransform();
    svgTransform.setScale(offsetX, offsetY);

    const matrix = element.ownerSVGElement
      .createSVGMatrix()
      .translate(transformPoint.x, transformPoint.y)
      // multiply is used instead of the scale while proportional scale is applied for a scale (?)
      .multiply(svgTransform.matrix)
      .translate(-transformPoint.x, -transformPoint.y)
      .multiply(transform.matrix);

    this.applyMatrix(matrix);
    // TODO: use generic monitoring for the elements
    return true;
  }
}
