import { MatrixTransform } from "./matrix-transform";
import { TransformsService } from "./transforms.service";

export class RectTransform extends MatrixTransform {
  transformPropertyX = "x";
  transformPropertyY = "y";
  constructor(
    element: SVGGraphicsElement,
    transformsService: TransformsService
  ) {
    super(element, transformsService);
  }

  beginMouseTransaction(mousePos: DOMPoint) {
    this.consolidate(this.element);
    super.beginMouseTransaction(mousePos);
    this.offset.x -= this.getX();
    this.offset.y -= this.getY();
  }

  /**
   * Convert transformation matrix to the X, Y coords as a preferable way to handle rect coords.
   */
  consolidate(element: SVGGraphicsElement) {
    let offsetX = 0;
    let offsetY = 0;
    const transformList = element.transform.baseVal;
    let changed = false;
    if (transformList.numberOfItems === 1) {
      const transform = transformList[0];
      if (transform.type === transform.SVG_TRANSFORM_TRANSLATE) {
        element.transform.baseVal.removeItem(0);
        offsetX = transform.matrix.e;
        offsetY = transform.matrix.f;
        element.removeAttribute("transform");
        changed = true;
      }
    } else if (transformList.numberOfItems > 1) {
      let consolidationRequired = true;
      for (let i = 0; i <= transformList.numberOfItems; i++) {
        const tr = transformList[i];
        if (
          tr &&
          (tr.type === tr.SVG_TRANSFORM_TRANSLATE ||
            tr.type === tr.SVG_TRANSFORM_MATRIX) &&
          tr.matrix.e &&
          tr.matrix.f
        ) {
          consolidationRequired = true;
          break;
        }
      }

      if (consolidationRequired) {
        const transform = transformList.consolidate();
        offsetX = transform.matrix.e;
        offsetY = transform.matrix.f;

        // Remove x and y from the matrix:
        const toSet = transform.matrix.translate(
          -transform.matrix.e,
          -transform.matrix.f
        );

        transform.setMatrix(toSet);
        element.transform.baseVal.initialize(transform);
        changed = true;
      }
    }

    if (offsetX) {
      this.setX(this.element[this.transformPropertyX].baseVal.value + offsetX);
      changed = true;
    }

    if (offsetY) {
      this.setY(this.element[this.transformPropertyY].baseVal.value + offsetY);
      changed = true;
    }

    if (changed) {
      this.transformsService.emitTransformed(this.element);
    }
  }
  /**
   * Should be consolidated first to get proper value.
   */
  getX() {
    return this.element[this.transformPropertyX].baseVal.value;
  }

  getY() {
    return this.element[this.transformPropertyY].baseVal.value;
  }

  setX(val: number) {
    this.element.setAttribute(
      this.transformPropertyX,
      String(Math.round(val * 100) / 100)
    );
  }

  setY(val: number) {
    this.element.setAttribute(
      this.transformPropertyY,
      String(Math.round(val * 100) / 100)
    );
  }

  translate(point: DOMPoint) {
    this.setX(point.x);
    this.setY(point.y);
    this.transformsService.emitTransformed(this.element);
  }
}
