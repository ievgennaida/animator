import { MatrixTransform } from "./matrix-transform";

export class RectTransform extends MatrixTransform {
  tranformPropertyX = "x";
  tranformPropertyY = "y";
  constructor(element: SVGGraphicsElement) {
    super(element);
  }

  moveToScreenPoint(element: SVGGraphicsElement, clientPoint: DOMPoint) {
    // const current = this.screenToElement(element, clientPoint);
    // this.translate(element, current);
  }

  beginMouseTransaction(mousePos: DOMPoint) {
    this.consolidate(this.element);
    super.beginMouseTransaction(mousePos);
    this.offset.x -= this.getX();
    this.offset.y -= this.getY();
  }

  beginTransaction() {}

  /**
   * Convert transformation matrix to the X, Y coords as a preferable way to handle rect coords.
   */
  consolidate(element: SVGGraphicsElement) {
    let offsetX = 0;
    let offsetY = 0;
    const transformList = element.transform.baseVal;
    if (transformList.numberOfItems === 1) {
      const transform = transformList[0];
      if (transform.type === transform.SVG_TRANSFORM_TRANSLATE) {
        element.transform.baseVal.removeItem(0);
        offsetX = transform.matrix.e;
        offsetY = transform.matrix.f;
        element.removeAttribute("transform");
      }
    } else if (transformList.numberOfItems > 1) {
      let consilidationRequired = true;
      for (let i = 0; i <= transformList.numberOfItems; i++) {
        const tr = transformList[i];
        if (
          (tr.type === tr.SVG_TRANSFORM_TRANSLATE ||
            tr.type === tr.SVG_TRANSFORM_MATRIX) &&
          tr.matrix.e &&
          tr.matrix.f
        ) {
          consilidationRequired = true;
          break;
        }
      }

      if (consilidationRequired) {
        const transform = transformList.consolidate();
        offsetX = transform.matrix.e;
        offsetY = transform.matrix.f;

        // Remove x and y from the matrix:
        transform.matrix.e = transform.matrix.f = 0;
        transform.setMatrix(transform.matrix);
        // TODO: set transform back
        // element.setAttribute('transform', JSON.stringify(transform.matrix)
        // element.transform.baseVal.initialize(transform);
      }
    }

    if (offsetX) {
      this.setX(this.element[this.tranformPropertyX].baseVal.value + offsetX);
    }

    if (offsetY) {
      this.setY(this.element[this.tranformPropertyY].baseVal.value + offsetY);
    }
  }
  /**
   * Should be consolidated first to get proper value.
   */
  getX() {
    return this.element[this.tranformPropertyX].baseVal.value;
  }

  getY() {
    return this.element[this.tranformPropertyY].baseVal.value;
  }

  setX(val: number) {
    this.element.setAttribute(
      this.tranformPropertyX,
      String(Math.round(val * 100) / 100)
    );
  }

  setY(val: number) {
    this.element.setAttribute(
      this.tranformPropertyY,
      String(Math.round(val * 100) / 100)
    );
  }

  translate(point: DOMPoint) {
    this.setX(point.x);
    this.setY(point.y);
  }
}
