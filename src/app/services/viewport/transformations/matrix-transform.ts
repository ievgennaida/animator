import { DecomposedMatrix } from "./decompose-matrix";
import { Utils } from "../../utils/utils";
import { TransformsService } from "./transforms.service";
import { AdornerType } from "../adorners/adorner-type";
export enum TransformationMode {
  Skew,
  Translate,
  Rotate,
}
export class MatrixTransform {
  offset: DOMPoint = null;
  startOffset = 0;
  vertical = true;
  mode: TransformationMode = TransformationMode.Translate;

  /**
   *
   */
  constructor(
    protected element: SVGGraphicsElement,
    protected transformsService: TransformsService
  ) {}

  handle: AdornerType = AdornerType.None;
  beginHandleTransformation(handle: AdornerType) {
    this.handle = handle;
  }
  beginMouseTransaction(pos: DOMPoint) {
    this.offset = Utils.toElementPoint(this.element, pos);
    this.mode = TransformationMode.Translate;
  }

  beginSkewTransaction(pos: DOMPoint, vertical: boolean = false) {
    this.mode = TransformationMode.Skew;
    this.vertical = vertical;
    const centerBox = Utils.getCenterTransform(this.element);
    this.offset = pos;
    const transformedCenter = centerBox.matrixTransform(
      this.element.getScreenCTM()
    );
    this.startOffset = vertical
      ? transformedCenter.x - pos.x
      : transformedCenter.y - pos.y;
  }

  beginMouseRotateTransaction(pos: DOMPoint) {
    this.mode = TransformationMode.Rotate;
    const transformOrigin = this.getTransformOrigin();
    const transformedCenter = transformOrigin.matrixTransform(
      this.element.getScreenCTM()
    );

    this.startOffset = -Utils.angle(transformedCenter, pos);

    const matrix = this.transformToElement(
      this.element,
      this.element.parentNode as SVGGraphicsElement
    );

    const decomposed = this.decomposeMatrix(matrix);
    this.startOffset -= decomposed.rotateZ;
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

  transformByMouse(screenPos: DOMPoint) {
    if (this.mode === TransformationMode.Rotate) {
      this.rotateByMouse(screenPos);
    } else if (this.mode === TransformationMode.Skew) {
      this.skewByMouse(screenPos);
    } else if (this.mode === TransformationMode.Translate) {
      this.moveByMouse(screenPos);
    }
  }

  moveByMouse(screenPos: DOMPoint) {
    const elementPoint = Utils.toElementPoint(this.element, screenPos);
    if (this.offset) {
      elementPoint.x -= this.offset.x;
      elementPoint.y -= this.offset.y;
    }
    this.translate(elementPoint);
  }

  translate(point: DOMPoint) {
    const transform =
      this.element.transform.baseVal.consolidate() ||
      this.element.ownerSVGElement.createSVGTransform();

    const matrix = transform.matrix.translate(point.x, point.y);
    transform.setMatrix(matrix);

    this.element.transform.baseVal.initialize(transform);
    this.transformsService.emitTransformed(this.element);
  }

  decomposeMatrix(matrix: DOMMatrix): DecomposedMatrix {
    const dec2 = DecomposedMatrix.decomposeMatrix(matrix);
    return dec2;
  }

  getTransformOrigin(): DOMPoint {
    return Utils.getCenterTransform(this.element);
  }

  rotateByMouse(currentViewPoint: DOMPoint) {
    const transformPoint = this.getTransformOrigin();

    const screenTransformOrigin = transformPoint.matrixTransform(
      this.element.getScreenCTM()
    );

    let angle = -Utils.angle(screenTransformOrigin, currentViewPoint);

    angle -= this.startOffset;
    this.rotate(angle, transformPoint);
  }

  rotate(angle: number, transformPoint: DOMPoint) {
    const transformList = this.element.transform;
    if (transformList.baseVal.numberOfItems === 0) {
      const rotation = this.element.ownerSVGElement.createSVGTransform();
      rotation.setRotate(angle, transformPoint.x, transformPoint.y);
      transformList.baseVal.appendItem(rotation);
      this.transformsService.emitTransformed(this.element);
      return;
    } else if (transformList.baseVal.numberOfItems === 1) {
      const rotation = transformList.baseVal[0];
      if (rotation.type === rotation.SVG_TRANSFORM_ROTATE) {
        rotation.setRotate(angle, transformPoint.x, transformPoint.y);
        this.transformsService.emitTransformed(this.element);
        return;
      }
    }

    const transform =
      this.element.transform.baseVal.consolidate() ||
      this.element.ownerSVGElement.createSVGTransform();
    transformPoint = transformPoint.matrixTransform(transform.matrix);
    const currentAngle = this.decomposeMatrix(transform.matrix).rotateZ;

    const offset = -(currentAngle - angle);
    const matrix = this.element.ownerSVGElement
      .createSVGMatrix()
      .translate(transformPoint.x, transformPoint.y)
      .rotate(offset, 0, 0)
      .translate(-transformPoint.x, -transformPoint.y)
      .multiply(transform.matrix);

    transform.setMatrix(matrix);
    this.element.transform.baseVal.initialize(transform);
    this.transformsService.emitTransformed(this.element);
  }

  skewByMouse(pos: DOMPoint) {
    const transformedCenter = new DOMPoint(
      this.vertical ? pos.x + this.startOffset : this.offset.x,
      this.vertical ? this.offset.y : pos.y + this.startOffset
    );

    let deg = -Utils.angle(transformedCenter, pos);
    if (!this.vertical) {
      deg = -deg - 90;
    }

    this.offset = pos;
    this.skewOffset(deg, this.vertical);
  }

  skewOffset(deg: number, vertical: boolean) {
    const transform =
      this.element.transform.baseVal.consolidate() ||
      this.element.ownerSVGElement.createSVGTransform();
    const centerBox = this.getTransformOrigin().matrixTransform(
      transform.matrix
    );
    let matrix = this.element.ownerSVGElement
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
    this.element.transform.baseVal.initialize(transform);
    this.transformsService.emitTransformed(this.element);
  }
}
