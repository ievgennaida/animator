export class MatrixTransform {
  offset: DOMPoint = null;
  element: SVGGraphicsElement = null;
  /**
   *
   */
  constructor(element: SVGGraphicsElement) {
    this.element = element;
  }

  beginMouseTransaction(mousePos: DOMPoint) {
    this.offset = this.screenToElement(this.element, mousePos);
  }

  elementToScreen(element: SVGGraphicsElement, elementPos: DOMPoint): DOMPoint {
    const current = elementPos.matrixTransform(element.getScreenCTM());
    return current;
  }

  screenToElement(
    element: SVGGraphicsElement,
    screenPoint: DOMPoint
  ): DOMPoint {
    const current = screenPoint.matrixTransform(
      element.getScreenCTM().inverse()
    );
    return current;
  }

  getTransformToElement(elem: SVGGraphicsElement): DOMMatrix {
    return elem.ownerSVGElement
      .getScreenCTM()
      .inverse()
      .multiply(elem.getScreenCTM());
  }

  moveByMouse(screenPos: DOMPoint) {
    const elementPoint = this.screenToElement(this.element, screenPos);
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
}
