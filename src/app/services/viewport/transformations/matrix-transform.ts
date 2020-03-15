import { DecomposedMatrix } from "./decompose-matrix";

export class MatrixTransform {
  offset: DOMPoint = null;
  startAngleOffset = 0;
  element: SVGGraphicsElement = null;
  /**
   *
   */
  constructor(element: SVGGraphicsElement) {
    this.element = element;
  }

  beginMouseTransaction(mousePos: DOMPoint) {
    this.offset = this.transformScreenToElement(this.element, mousePos);
  }

  beginMouseRotateTransaction(mousePos: DOMPoint) {
    const transformOrigin = this.getTransformOrigin();
    const tranformedCenter = transformOrigin.matrixTransform(
      this.element.getScreenCTM()
    );

    this.startAngleOffset = -this.angle(tranformedCenter, mousePos);

    const matrix = this.transformToElement(
      this.element,
      this.element.parentNode as SVGGraphicsElement
    );

    const decomposed = this.decomposeMatrix(matrix);
    console.log(JSON.stringify(decomposed));
    this.startAngleOffset -= decomposed.rotateZ;
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

  transformScreenToElement(
    element: SVGGraphicsElement,
    screenPoint: DOMPoint
  ): DOMPoint {
    const current = screenPoint.matrixTransform(
      element.getScreenCTM().inverse()
    );
    return current;
  }

  moveByMouse(screenPos: DOMPoint) {
    const elementPoint = this.transformScreenToElement(this.element, screenPos);
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
  }

  angle(p1: DOMPoint, p2: DOMPoint): number {
    return (Math.atan2(p1.y - p2.y, p2.x - p1.x) * 180) / Math.PI;
  }

  decomposeMatrix(matrix: DOMMatrix): DecomposedMatrix {
    const dec2 = DecomposedMatrix.decomposeMatrix(matrix);
    return dec2;
  }

  getTransformOrigin(): DOMPoint {
    const box = this.element.getBBox();
    const transformPoint = new DOMPoint(
      box.x + box.width / 2,
      box.y + box.height / 2
    );

    return transformPoint;
  }

  rotateByMouseMove(currentViewPoint: DOMPoint) {
    const transformPoint = this.getTransformOrigin();

    const screenTransformOrigin = transformPoint.matrixTransform(
      this.element.getScreenCTM()
    );

    let angle = -this.angle(screenTransformOrigin, currentViewPoint);

    angle -= this.startAngleOffset;
    this.rotate(angle, transformPoint);
  }

  rotate(angle: number, transformPoint: DOMPoint) {
    const transformList = this.element.transform;
    if (transformList.baseVal.numberOfItems === 0) {
      const rotation = this.element.ownerSVGElement.createSVGTransform();
      rotation.setRotate(angle, transformPoint.x, transformPoint.y);
      transformList.baseVal.appendItem(rotation);
      return;
    } else if (transformList.baseVal.numberOfItems === 1) {
      const rotation = transformList.baseVal[0];
      if (rotation.type === rotation.SVG_TRANSFORM_ROTATE) {
        rotation.setRotate(angle, transformPoint.x, transformPoint.y);
        return;
      }
    }

    const transform =
      this.element.transform.baseVal.consolidate() ||
      this.element.ownerSVGElement.createSVGTransform();
    transformPoint = transformPoint.matrixTransform(transform.matrix);
    const currentAngle = this.decomposeMatrix(transform.matrix).rotateZ;

    const offset = -(currentAngle - angle);
    console.log(currentAngle);
    const matrix = this.element.ownerSVGElement
      .createSVGMatrix()
      .translate(transformPoint.x, transformPoint.y)
      .rotate(offset, 0, 0)
      .translate(-transformPoint.x, -transformPoint.y)
      .multiply(transform.matrix);

    transform.setMatrix(matrix);
    this.element.transform.baseVal.initialize(transform);
  }
}
