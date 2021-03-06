import { Injectable } from "@angular/core";
import { AdornerType } from "src/app/models/adorner-type";
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
import { BaseTransformAction } from "../base-transform-action";
import { TransformationModeIcon } from "../../../../models/transformation-mode";
import { AdornerTypeUtils } from "src/app/models/adorner-type-utils";
import { AdornerPointType } from "src/app/models/adorner-point-type";

/**
 * Matrix scale in screen rectangle coordinates.
 */
@Injectable({
  providedIn: "root",
})
export class MatrixScaleAction extends BaseTransformAction {
  title = "Scale";
  icon = TransformationModeIcon.scale;

  /**
   * Start click position in anchor coordinates.
   */
  start: DOMPoint | null = null;

  /**
   * Transformation coordinates anchor.
   */
  anchor: SVGGraphicsElement | null = null;
  transformElementCoordinates = false;
  /**
   * Transform origin.
   */
  transformOrigin: DOMPoint | null = null;

  initTransformMatrix: DOMMatrix | null = null;
  constructor(
    propertiesService: PropertiesService,
    protected viewService: ViewService
  ) {
    super(propertiesService);
  }
  init(
    node: TreeNode,
    screenPos: DOMPoint | null,
    handle: HandleData | null
  ): void {
    this.handle = handle;
    if (!this.handle) {
      return;
    }
    this.start = screenPos;
    this.node = node;
    this.transformElementCoordinates =
      this.handle.type === AdornerType.transformedElement;

    const screenAdorner = this.handle?.adorner?.screen;
    if (!screenAdorner) {
      return;
    }
    if (this.transformElementCoordinates) {
      this.anchor = node.getElement();
    } else {
      this.anchor = this.viewService.viewport;
    }
    if (!this.anchor) {
      console.log("Transform be initialized, anchor is required");
      return;
    }
    this.initTransformMatrix = MatrixUtils.getMatrix(this.node.getElement());
    this.start = Utils.toElementPoint(this.anchor, screenPos);
    const oppositeHandle = AdornerTypeUtils.getOpposite(this.handle.handle);
    this.transformOrigin = Utils.toElementPoint(
      this.anchor,
      screenAdorner.get(oppositeHandle)
    );
  }
  getElement(): SVGGraphicsElement | null {
    if (!this.node) {
      return null;
    }
    return this.node.getElement();
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
    if (!screenPos || !this.start || !this.handle || !this.anchor) {
      return false;
    }
    if (!this.transformOrigin) {
      console.log("Transform origin is required to scale element.");
      return false;
    }
    const transformed = Utils.toElementPoint(this.anchor, screenPos);
    if (!transformed) {
      return false;
    }
    const offset = this.getScale(
      this.handle.handle,
      this.start,
      transformed,
      this.transformOrigin
    );

    return this.scaleOffset(offset.x, offset.y, this.transformOrigin);
  }
  scaleOffset(
    offsetX: number,
    offsetY: number,
    transformPoint: DOMPoint
  ): boolean {
    const element = this.node?.getElement();
    if (!element) {
      return false;
    }
    const matrix = MatrixUtils.generateScaleMatrix(
      element,
      offsetX,
      offsetY,
      transformPoint
    );
    return this.applyMatrix(matrix, true);
  }

  /**
   * Scale in screen coordinates.
   * Used to scale groups and element by bounds adorners.
   *
   * @param screenPos new screen position.
   */
  scaleByMouse(screenPos: DOMPoint): boolean {
    if (!screenPos || !this.start || !this.handle) {
      return false;
    }

    // Anchor is used to avoid point mismatch when screen is scrolled or panned.
    // Position is not reliable when screen coordinates are used.
    const startScreen = Utils.toScreenPoint(this.anchor, this.start);
    const screenTransformOrigin = Utils.toScreenPoint(
      this.anchor,
      this.transformOrigin
    );
    if (!startScreen || !screenTransformOrigin) {
      return false;
    }
    const calculatedOffset = this.getScale(
      this.handle.handle,
      startScreen,
      screenPos,
      screenTransformOrigin
    );
    // this.debugPoints[0] = screenTransformOrigin;
    // scale change in screen coordinates:
    const screenScaleMatrix = MatrixUtils.generateScaleMatrix(
      this.getElement() || this.anchor,
      calculatedOffset.x,
      calculatedOffset.y,
      screenTransformOrigin
    );

    return this.scaleByScreenMatrix(screenScaleMatrix);
  }

  getScale(
    adornerPoint: AdornerPointType,
    startPos: DOMPoint,
    curPos: DOMPoint,
    transformOrigin: DOMPoint
  ): DOMPoint {
    const newWidth = transformOrigin.x - curPos.x;
    const newHeight = transformOrigin.y - curPos.y;
    const initialWidth = transformOrigin.x - startPos.x;
    const initialHeight = transformOrigin.y - startPos.y;
    let scaleY: number | null = newHeight / initialHeight;
    let scaleX: number | null = newWidth / initialWidth;
    if (
      adornerPoint === AdornerPointType.topCenter ||
      adornerPoint === AdornerPointType.bottomCenter
    ) {
      scaleX = null;
    } else if (
      adornerPoint === AdornerPointType.rightCenter ||
      adornerPoint === AdornerPointType.leftCenter
    ) {
      scaleY = null;
    }
    scaleX = MatrixUtils.normalizeScale(scaleX);
    scaleY = MatrixUtils.normalizeScale(scaleY);
    return new DOMPoint(scaleX, scaleY);
  }
  /**
   * Scale element by a matrix in screen coordinates and convert it back to the element coordinates.
   * Usage: element is transformed by itself, you can compose screen matrix and apply it to the element directly.
   *
   * @param screenScaleMatrix screen coordinates matrix.
   */
  scaleByScreenMatrix(screenScaleMatrix: DOMMatrix | null): boolean {
    const element = this.getElement();
    const parent = element?.parentNode as SVGGraphicsElement;
    if (
      !element ||
      !element ||
      !screenScaleMatrix ||
      !this.initTransformMatrix
    ) {
      return false;
    }
    // Get original to screen matrix from which transformation was started (anchor for when screen coords are changed on pan)
    const toScreenMatrix = parent
      .getScreenCTM()
      ?.multiply(this.initTransformMatrix);
    if (!toScreenMatrix) {
      console.log("Cannot transform matrix from parent");
      return false;
    }
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
  applyMatrix(matrix: DOMMatrix | null, applyCurrent = false): boolean {
    if (!matrix) {
      return false;
    }
    if (!this.node) {
      console.log(
        "applyMatrix. Should be initialized first. Node cannot be empty"
      );
      return false;
    }
    if (this.initialValues.size === 0) {
      this.saveInitialValues([this.node], [TransformPropertyKey]);
    }
    if (applyCurrent) {
      const element = this.node.getElement();
      if (element) {
        const transform = Utils.getElementTransform(element);
        matrix = transform.matrix.multiply(matrix);
      }
    }
    return this.propertiesService.setMatrixTransform(this.node, matrix);
  }

  /**
   * Set direct scale value.
   */
  scale(scaleX: number, scaleY: number, transformPoint: DOMPoint): boolean {
    const element = this.node?.getElement();
    if (!element) {
      console.log("Cannot scale for the unknown element");
      return false;
    }
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
    const ownerElement = element.ownerSVGElement;
    if (!ownerElement) {
      console.log("Cannot scale, owner document element cannot be found");
      return false;
    }
    const svgTransform = ownerElement.createSVGTransform();
    svgTransform.setScale(offsetX, offsetY);

    const matrix = ownerElement
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
