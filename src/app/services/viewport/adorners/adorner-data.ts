export class AdornerData {
  topCenter: DOMPoint = null;
  bottomCenter: DOMPoint = null;
  leftCenter: DOMPoint = null;
  rightCenter: DOMPoint = null;

  bottomLeft: DOMPoint = null;
  bottomRight: DOMPoint = null;
  topLeft: DOMPoint = null;
  topRight: DOMPoint = null;
  centerTransform: DOMPoint = null;
  element: SVGGraphicsElement = null;

  clone(): AdornerData {
    const cloned = new AdornerData();
    cloned.element = this.element;
    if (this.bottomLeft) {
      cloned.bottomLeft = new DOMPoint(this.bottomLeft.x, this.bottomLeft.y);
    }
    if (this.bottomRight) {
      cloned.bottomRight = new DOMPoint(this.bottomRight.x, this.bottomRight.y);
    }
    if (this.topLeft) {
      cloned.topLeft = new DOMPoint(this.topLeft.x, this.topLeft.y);
    }
    if (this.topRight) {
      cloned.topRight = new DOMPoint(this.bottomLeft.x, this.topRight.y);
    }

    if (this.topCenter) {
      cloned.topCenter = new DOMPoint(this.topCenter.x, this.topCenter.y);
    }
    if (this.bottomCenter) {
      cloned.bottomCenter = new DOMPoint(
        this.bottomCenter.x,
        this.bottomCenter.y
      );
    }
    if (this.leftCenter) {
      cloned.leftCenter = new DOMPoint(this.leftCenter.x, this.leftCenter.y);
    }
    if (this.rightCenter) {
      cloned.rightCenter = new DOMPoint(this.rightCenter.x, this.rightCenter.y);
    }

    if (this.centerTransform) {
      cloned.centerTransform = new DOMPoint(
        this.centerTransform.x,
        this.centerTransform.y
      );
    }
    return cloned;
  }

  getTransformed(m: DOMMatrix): AdornerData {
    if (!m) {
      return this.clone();
    }

    const cloned = new AdornerData();
    cloned.element = this.element;
    if (this.bottomLeft) {
      cloned.bottomLeft = this.bottomLeft.matrixTransform(m);
    }
    if (this.bottomRight) {
      cloned.bottomRight = this.bottomRight.matrixTransform(m);
    }
    if (this.topLeft) {
      cloned.topLeft = this.topLeft.matrixTransform(m);
    }
    if (this.topRight) {
      cloned.topRight = this.topRight.matrixTransform(m);
    }

    if (this.topCenter) {
      cloned.topCenter = this.topCenter.matrixTransform(m);
    }
    if (this.bottomCenter) {
      cloned.bottomCenter = this.bottomCenter.matrixTransform(m);
    }
    if (this.leftCenter) {
      cloned.leftCenter = this.leftCenter.matrixTransform(m);
    }
    if (this.rightCenter) {
      cloned.rightCenter = this.rightCenter.matrixTransform(m);
    }

    if (this.centerTransform) {
      cloned.centerTransform = this.centerTransform.matrixTransform(m);
    }
    return cloned;
  }
}
