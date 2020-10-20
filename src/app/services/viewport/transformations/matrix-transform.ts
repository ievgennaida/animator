import { DecomposedMatrix } from "./decompose-matrix";
import { Utils } from "../../utils/utils";
import { AdornerType, AdornerTypeUtils } from "../adorners/adorner-type";
import { HandleData } from "src/app/models/handle-data";
import { DecomposeTransform } from "./decompose-transform";
import { TreeNode } from "src/app/models/tree-node";
import { AdornerMode } from '../adorners/adorner';
export enum TransformationMode {
  None,
  Skew,
  Translate,
  Handle,
  Rotate,
}
export class MatrixTransform {
  /**
   * Start click position in anchor coordinates.
   */
  start: DOMPoint = null;
  initBBox: DOMRect = null;

  /**
   * Skew mode, vertical or horizontal.
   */
  vertical = true;
  /**
   * Transformation coordinates anchor.
   */
  anchor: SVGGraphicsElement = null;
  transformOrigin: DOMPoint = null;
  adornerOrigin: DOMPoint = null;
  initTransformMatrix: DOMMatrix = null;
  debugPoints: DOMPoint[] = [];
  startOffset = 0;
  mode: TransformationMode = TransformationMode.None;
  handle: HandleData;
  transformElementCoordinates = false;
  constructor(public node: TreeNode) {}

  getElement(): SVGGraphicsElement {
    if (this.node) {
      return this.node.getElement();
    }

    return null;
  }
  beginHandleTransformation(screenPos: DOMPoint, handle: HandleData) {
    this.handle = handle;
    this.mode = TransformationMode.Handle;
    this.start = screenPos;
    const element = this.getElement();
    this.transformElementCoordinates = this.handle.adorner.mode === AdornerMode.TransformedElement;

    if (this.transformElementCoordinates) {
      this.anchor = element;
      this.initBBox = this.node.getBBox();
    } else {
      this.anchor = element.ownerSVGElement;
      this.initBBox = this.handle.adorner.getBBox();
      const toElementMatrix = this.anchor.getScreenCTM().inverse();
      // To viewport element coordinates:
      this.initBBox = Utils.matrixRectTransform(
        this.initBBox,
        toElementMatrix,
        false
      );

      this.initTransformMatrix = this.getMatrix(element);
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

  beginMouseTransaction(screenPos: DOMPoint) {
    const element = this.getElement();
    const startPoint = Utils.toElementPoint(element, screenPos);
    this.start = startPoint;
    this.mode = TransformationMode.Translate;
  }
  beginSkewXTransaction(pos: DOMPoint) {
    this.beginSkewTransaction(pos, true);
  }
  beginSkewYTransaction(pos: DOMPoint) {
    this.beginSkewTransaction(pos, false);
  }
  beginSkewTransaction(pos: DOMPoint, vertical: boolean = false) {
    const element = this.getElement();
    this.vertical = vertical;
    const centerBox = Utils.getCenterTransform(element);
    this.start = centerBox;
    const transformedCenter = Utils.toScreenPoint(element, centerBox);
    this.startOffset = vertical
      ? transformedCenter.x - pos.x
      : transformedCenter.y - pos.y;
  }
  beginMouseRotateTransaction(pos: DOMPoint) {
    this.mode = TransformationMode.Rotate;
    const element = this.getElement();
    this.transformOrigin = this.getTransformOrigin();
    const transformedCenter = Utils.toScreenPoint(
      element,
      this.transformOrigin
    );
    this.startOffset = -Utils.angle(transformedCenter, pos);

    // Get current transform matrix
    const matrix = this.transformToElement(
      element,
      element.parentNode as SVGGraphicsElement
    );

    if (matrix) {
      const decomposed = this.decomposeMatrix(matrix);
      this.startOffset -= decomposed.rotateZ;
    }
  }
  getSizeX(): number {
    const element = this.getElement();
    return element.getBBox().width;
  }
  getSizeY(): number {
    const element = this.getElement();
    return element.getBBox().height;
  }
  transformElementToScreen(
    element: SVGGraphicsElement,
    elementPos: DOMPoint
  ): DOMPoint {
    const current = elementPos.matrixTransform(element.getScreenCTM());
    return current;
  }

  transformToElement(
    fromElement: SVGGraphicsElement,
    toElement: SVGGraphicsElement
  ): DOMMatrix {
    if (!toElement || !fromElement) {
      return null;
    }

    return toElement
      .getScreenCTM()
      .inverse()
      .multiply(fromElement.getScreenCTM());
  }

  transformByMouse(screenPos: DOMPoint): boolean {
    if (this.mode === TransformationMode.Rotate) {
      return this.rotateByMouse(screenPos);
    } else if (this.mode === TransformationMode.Skew) {
      return this.skewByMouse(screenPos);
    } else if (this.mode === TransformationMode.Translate) {
      return this.moveByMouse(screenPos);
    } else if (this.mode === TransformationMode.Handle) {
      return this.transformHandle(screenPos);
    }
  }
  transformHandle(screenPos: DOMPoint) {
    if (this.transformElementCoordinates) {
      return this.scaleElementByMouse(screenPos);
    } else {
      return this.scaleByMouse(screenPos);
    }
  }

  scaleElementByMouse(screenPos: DOMPoint): boolean {
    if (
      !screenPos ||
      !this.initBBox ||
      this.initBBox.height === 0 ||
      this.initBBox.width === 0
    ) {
      return false;
    }
    const element = this.getElement();
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
      Utils.bitwiseEquals(handle, AdornerType.TopCenter) ||
      Utils.bitwiseEquals(handle, AdornerType.BottomCenter)
    ) {
      scaleX = null;
    } else if (
      Utils.bitwiseEquals(handle, AdornerType.RightCenter) ||
      Utils.bitwiseEquals(handle, AdornerType.LeftCenter)
    ) {
      scaleY = null;
    }

    return this.scaleOffset(scaleX, scaleY, this.transformOrigin);
  }

  /**
   * Scale in screen coordinates.
   * Used to scale groups and element by screen adorners.
   * @param screenPos new screen position.
   */
  scaleByMouse(screenPos: DOMPoint): boolean {
    if (
      !screenPos ||
      !this.initBBox ||
      this.initBBox.height === 0 ||
      this.initBBox.width === 0
    ) {
      return false;
    }

    const offset = screenPos;
    // Anchor is used to avoid point mismatch when screen is scrolled or panned.
    // When screen coordinates are used, than it will be wrong after any change.
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
      Utils.bitwiseEquals(handle, AdornerType.TopCenter) ||
      Utils.bitwiseEquals(handle, AdornerType.BottomCenter)
    ) {
      scaleX = null;
    } else if (
      Utils.bitwiseEquals(handle, AdornerType.RightCenter) ||
      Utils.bitwiseEquals(handle, AdornerType.LeftCenter)
    ) {
      scaleY = null;
    }
    scaleX = this.normalizeScale(scaleX);
    scaleY = this.normalizeScale(scaleY);
    // scale change in screen coordinates:
    const screenScaleMatrix = this.generateScaleMatrix(
      scaleX,
      scaleY,
      screenTransformOrigin
    );

    this.scaleByScreenMatrix(screenScaleMatrix);
    return true;
  }

  scaleByScreenMatrix(screenScaleMatrix: DOMMatrix) {
    const element = this.getElement();
    const parentCTM = (element.parentNode as SVGGraphicsElement).getScreenCTM();
    const toScreenMatrix = parentCTM.multiply(this.initTransformMatrix);
    // Scale element by a matrix in screen coordinates and convert it back to the element coordinates:
    const currentMatrix = this.initTransformMatrix.multiply(
      toScreenMatrix
        .inverse()
        .multiply(screenScaleMatrix)
        .multiply(toScreenMatrix)
    );
    // Apply new created transform back to the element:
    this.setMatrix(element, currentMatrix);
  }

  moveByMouse(screenPos: DOMPoint): boolean {
    const element = this.getElement();
    const offset = Utils.toElementPoint(element, screenPos);
    if (!offset) {
      return false;
    }
    if (this.start) {
      offset.x -= this.start.x;
      offset.y -= this.start.y;
    }
    return this.translate(offset.x, offset.y);
  }

  translate(x: number, y: number): boolean {
    const element = this.getElement();
    // console.log("move:" + point.x + "x" + point.y);
    const transformList = element.transform;
    if (transformList.baseVal.numberOfItems === 0) {
      const svgTransform = element.ownerSVGElement.createSVGTransform();
      svgTransform.setTranslate(x, y);
      transformList.baseVal.appendItem(svgTransform);
      return true;
    } else if (transformList.baseVal.numberOfItems === 1) {
      const svgTransform = transformList.baseVal[0];
      if (svgTransform.type === svgTransform.SVG_TRANSFORM_TRANSLATE) {
        const decompose = DecomposeTransform.decomposeTransformList(
          transformList.baseVal
        );
        if (decompose && decompose.translateX && decompose.translateY) {
          svgTransform.setTranslate(
            decompose.translateX + x,
            decompose.translateY + y
          );
        } else {
          svgTransform.setTranslate(x, y);
        }

        return true;
      }
    }

    const transform = this.getElementTransform(element);

    const matrix = transform.matrix.translate(x, y);
    transform.setMatrix(matrix);

    element.transform.baseVal.initialize(transform);

    return true;
  }

  decomposeMatrix(matrix: DOMMatrix): DecomposedMatrix {
    const dec2 = DecomposedMatrix.decomposeMatrix(matrix);
    return dec2;
  }

  getTransformOrigin(): DOMPoint {
    if (this.handle && this.handle.adorner) {
      const center = this.handle.adorner.centerTransform;
      if (center) {
        const offset = Utils.toElementPoint(this.getElement(), center);
        return offset;
      }
    }
    const element = this.getElement();
    return Utils.getCenterTransform(element);
  }

  rotateByMouse(currentViewPoint: DOMPoint): boolean {
    const transformPoint = this.transformOrigin; // this.getTransformOrigin();
    const element = this.getElement();
    const screenTransformOrigin = Utils.toScreenPoint(element, transformPoint);
    let angle = -Utils.angle(screenTransformOrigin, currentViewPoint);

    angle -= this.startOffset;

    return this.rotate(angle, transformPoint);
  }
  normalizeScale(scale: number | null): number {
    scale = scale === null ? 1 : scale;
    if (!Number.isFinite(scale)) {
      scale = 1;
    }
    if (scale > Number.MAX_VALUE) {
      scale = Number.MAX_VALUE;
    }
    return scale;
  }
  scaleOffset(
    offsetX: number | null,
    offsetY: number | null,
    transformPoint: DOMPoint
  ): boolean {
    const element = this.getElement();
    offsetY = this.normalizeScale(offsetY);
    offsetX = this.normalizeScale(offsetX);

    const transform = this.getElementTransform(element);

    const matrix = this.generateScaleMatrix(
      offsetX,
      offsetY,
      transformPoint,
      transform.matrix
      // this.initMatrix
    );

    transform.setMatrix(matrix);
    element.transform.baseVal.initialize(transform);
    return true;
  }

  generateScaleMatrix(
    offsetX: number | null,
    offsetY: number | null,
    transformPoint: DOMPoint | null = null,
    matrix: DOMMatrix | null = null
  ): DOMMatrix | null {
    const element = this.getElement();
    const svgTransform = element.ownerSVGElement.createSVGTransform();
    svgTransform.setScale(offsetX, offsetY);

    let scalingMatrix = element.ownerSVGElement.createSVGMatrix();

    if (matrix) {
      scalingMatrix = scalingMatrix.multiply(matrix);
    }

    if (transformPoint) {
      scalingMatrix = scalingMatrix
        .translate(transformPoint.x, transformPoint.y)
        // multiply is used instead of the scale while proportional scale is applied for a scale (?)
        .multiply(svgTransform.matrix)
        .translate(-transformPoint.x, -transformPoint.y);
    } else {
      scalingMatrix = scalingMatrix.multiply(svgTransform.matrix);
    }
    return scalingMatrix;
  }
  /**
   * Set direct scale value.
   */
  scale(scaleX: number, scaleY: number, transformPoint: DOMPoint): boolean {
    const element = this.getElement();

    const transform = this.getElementTransform(element);
    transformPoint = transformPoint.matrixTransform(transform.matrix);
    const decomposed = this.decomposeMatrix(transform.matrix);
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

    transform.setMatrix(matrix);
    element.transform.baseVal.initialize(transform);
    // TODO: use generic monitoring for the elements
    return true;
  }

  /**
   * Set direct angle value.
   * @param angle rotation angle.
   * @param transformPoint transform center.
   */
  rotate(angle: number, transformPoint: DOMPoint): boolean {
    const element = this.getElement();
    // const transformList = element.transform;
    /*if (transformList.baseVal.numberOfItems === 0) {
      const svgTransform = element.ownerSVGElement.createSVGTransform();
      svgTransform.setRotate(angle, transformPoint.x, transformPoint.y);
      transformList.baseVal.appendItem(svgTransform);
      return true;
    } else if (transformList.baseVal.numberOfItems === 1) {
      const svgTransform = transformList.baseVal[0];
      if (svgTransform.type === svgTransform.SVG_TRANSFORM_ROTATE) {
        svgTransform.setRotate(angle, transformPoint.x, transformPoint.y);
        return true;
      }
    }*/

    const transform = this.getElementTransform(element);

    transformPoint = transformPoint.matrixTransform(transform.matrix);
    const currentAngle = this.decomposeMatrix(transform.matrix).rotateZ;

    const offset = -(currentAngle - angle);
    const matrix = element.ownerSVGElement
      .createSVGMatrix()
      .translate(transformPoint.x, transformPoint.y)
      .rotate(offset, 0)
      .translate(-transformPoint.x, -transformPoint.y)
      .multiply(transform.matrix);

    transform.setMatrix(matrix);
    element.transform.baseVal.initialize(transform);
    return true;
  }
  fitToBounds(
    elementNode: TreeNode,
    screenBounds: DOMRect,
    changePosition = true
  ): boolean {
    if (!screenBounds) {
      return false;
    }
    const element = elementNode.getElement();
    const bbox = element.getBoundingClientRect();
    // Get center of figure in element coordinates:
    const scaleX = screenBounds.width / bbox.width;
    const scaleY = screenBounds.height / bbox.height;
    const inputCenter = Utils.getRectCenter(bbox);
    let offsetX = 0;
    let offsetY = 0;
    if (changePosition) {
      const destCenter = Utils.getRectCenter(screenBounds);
      offsetX = destCenter.x - inputCenter.x;
      offsetY = destCenter.y - inputCenter.y;
    }

    // create scale matrix:
    const scaleMatrix = this.generateScaleMatrix(scaleX, scaleY, inputCenter);

    // get element self transformation matrix:

    const scaleAndTransform = element.ownerSVGElement
      .createSVGMatrix()
      .translate(offsetX, offsetY)
      .multiply(scaleMatrix);

    const toScreenMatrix = element.getScreenCTM();
    // Scale element by a matrix in screen coordinates and convert it back to the element coordinates:
    let currentMatrix = this.getElementTransform(element).matrix;
    currentMatrix = currentMatrix.multiply(
      toScreenMatrix
        .inverse()
        .multiply(scaleAndTransform)
        .multiply(toScreenMatrix)
    );
    // Apply new created transform back to the element:
    this.setMatrix(element, currentMatrix);
    return true;
  }

  getMatrix(element: SVGGraphicsElement): DOMMatrix {
    return (element.parentNode as SVGGraphicsElement)
      .getScreenCTM()
      .inverse()
      .multiply(element.getScreenCTM());
  }
  setMatrix(element: SVGGraphicsElement, matrix: DOMMatrix) {
    const transform = this.getElementTransform(element);
    transform.setMatrix(matrix);
    element.transform.baseVal.initialize(transform);
  }
  getElementTransform(element: SVGGraphicsElement): SVGTransform {
    const transform =
      element.transform.baseVal.consolidate() ||
      element.ownerSVGElement.createSVGTransform();
    return transform;
  }
  skewByMouse(screenPos: DOMPoint): boolean {
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
    const element = this.getElement();
    const transform  = this.getElementTransform(element);
    const centerBox = this.getTransformOrigin().matrixTransform(
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
