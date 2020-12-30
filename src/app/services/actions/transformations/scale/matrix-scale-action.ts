import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { PropertiesService } from "src/app/services/properties.service";
import { DecomposedMatrix } from "../../../../models/decompose-matrix";
import { Utils } from "../../../utils/utils";
import { AdornerMode } from "../../../viewport/adorners/adorner";
import {
  AdornerType,
  AdornerTypeUtils,
} from "../../../viewport/adorners/adorner-type";
import { BaseTransformAction } from "../base-transform-action";
import { MatrixUtils } from "../matrix-utils";

@Injectable({
  providedIn: "root",
})
export class MatrixScaleAction extends BaseTransformAction {
  constructor(propertiesService: PropertiesService) {
    super(propertiesService);
  }
  title = "Matrix Scale";
  icon = "aspect_ratio";
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
  adornerOrigin: DOMPoint = null;
  initTransformMatrix: DOMMatrix = null;
  attributesToStore = [MatrixUtils.TransformPropertyKey];
  transformElementCoordinates = false;

  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData) {

    this.handle = handle;
    this.start = screenPos;
    this.node = node;
    const element = node.getElement();
    // TODO: read from the config
    this.transformElementCoordinates =
      this.handle.adorner.mode === AdornerMode.TransformedElement;
    if (this.transformElementCoordinates) {
      this.anchor = element;
      this.initBBox = this.node.getBBox();
    } else {
      this.anchor = element.ownerSVGElement;
      this.initBBox = this.handle.adorner.getBBox();
      const toElementMatrix = this.anchor.getScreenCTM().inverse();
      // To viewport element coordinates:
      this.initBBox = MatrixUtils.matrixRectTransform(
        this.initBBox,
        toElementMatrix,
        false
      );

      this.initTransformMatrix = MatrixUtils.getMatrix(element);
    }

    this.start = Utils.toElementPoint(this.anchor, screenPos);
    // Adorner origin position in anchor coordinates
    this.adornerOrigin = AdornerTypeUtils.getAdornerPosition(
      this.initBBox,
      this.handle.handles
    );

    // Opposite point = transform origin
    this.transformOrigin = AdornerTypeUtils.getAdornerPosition(
      this.initBBox,
      AdornerTypeUtils.getOpposite(this.handle.handles)
    );
  }

  transformByMouse(screenPos: DOMPoint): boolean {
    if (this.transformElementCoordinates) {
      return this.scaleElementByMouse(screenPos);
    } else {
      return this.scaleByMouse(screenPos);
    }
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

    const handle = this.handle.handles;
    const newWidth = this.transformOrigin.x - offset.x;
    const newHeight = this.transformOrigin.y - offset.y;

    let scaleY = newHeight / this.initBBox.height;
    let scaleX = newWidth / this.initBBox.width;
    scaleY = (this.transformOrigin.y <= this.initBBox.y ? -1 : 1) * scaleY;
    scaleX = (this.transformOrigin.x <= this.initBBox.x ? -1 : 1) * scaleX;
    if (
      handle === AdornerType.TopCenter ||
      handle === AdornerType.BottomCenter
    ) {
      scaleX = null;
    } else if (
      handle === AdornerType.RightCenter ||
      handle === AdornerType.LeftCenter
    ) {
      scaleY = null;
    }

    return this.scaleOffset(scaleX, scaleY, this.transformOrigin);
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
    const handle = this.handle.handles;
    const newWidth = screenTransformOrigin.x - offset.x;
    const newHeight = screenTransformOrigin.y - offset.y;
    const initialWidth = screenTransformOrigin.x - startScreen.x;
    const initialHeight = screenTransformOrigin.y - startScreen.y;
    let scaleY = newHeight / initialHeight;
    let scaleX = newWidth / initialWidth;

    if (
      handle === AdornerType.TopCenter ||
      handle === AdornerType.BottomCenter
    ) {
      scaleX = null;
    } else if (
      handle === AdornerType.RightCenter ||
      handle === AdornerType.LeftCenter
    ) {
      scaleY = null;
    }
    scaleX = MatrixUtils.normalizeScale(scaleX);
    scaleY = MatrixUtils.normalizeScale(scaleY);
    // scale change in screen coordinates:
    const screenScaleMatrix = MatrixUtils.generateScaleMatrix(
      this.node.getElement(),
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
    return this.applyMatrix(newTransformationMatrix, false);
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
    return this.applyMatrix(matrix, true);
  }

  /**
   * Apply transformation by matrix.
   */
  applyMatrix(matrix: DOMMatrix, offset: boolean): boolean {
    this.saveInitialValue();
    const element = this.node.getElement();
    const transform = Utils.getElementTransform(element);
    if (offset) {
      matrix = transform.matrix.multiply(matrix);
    }
    transform.setMatrix(matrix);
    element.transform.baseVal.initialize(transform);
    return true;
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

    this.applyMatrix(matrix, false);
    // TODO: use generic monitoring for the elements
    return true;
  }
}
