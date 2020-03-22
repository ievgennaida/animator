export class Utils {
  static getVector(a: DOMPoint, b: DOMPoint = null): DOMPoint {
    const vector = new DOMPoint(a.x - b.x, a.y - b.y);
    return vector;
  }

  static reverseVector(a: DOMPoint): DOMPoint {
    const vector = new DOMPoint(-a.x, -a.y);
    return vector;
  }

  static getPerpendicularVector(a: DOMPoint): DOMPoint {
    const vector = new DOMPoint(-a.y, a.x);
    return vector;
  }

  static getDirection(a: DOMPoint, b: DOMPoint, c: DOMPoint): number {
    // To determine which side of the line a point c falls
    return (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x);
  }

  static getCenter(a: DOMPoint, b: DOMPoint): DOMPoint {
    const vector = new DOMPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
    return vector;
  }

  static normilizeSelf(vector: DOMPoint): DOMPoint {
    const mag = Utils.getLenght(vector);
    if (mag === 0) {
      return vector;
    }
    vector.x /= mag;
    vector.y /= mag;
    return vector;
  }

  static getLenght(a: DOMPoint, b: DOMPoint = null): number {
    const leng = Math.sqrt(
      Math.pow(a.x - (b ? b.x : 0), 2) + Math.pow(a.y - (b ? b.y : 0), 2)
    );
    return leng;
  }

  static angle(p1: DOMPoint, p2: DOMPoint): number {
    return (Math.atan2(p1.y - p2.y, p2.x - p1.x) * 180) / Math.PI;
  }

  static getCenterTransform(
    element: SVGGraphicsElement,
    bboxCache: DOMRect = null
  ): DOMPoint {
    if (!element) {
      return null;
    }

    if (!bboxCache) {
      bboxCache = element.getBBox();
    }

    const x = parseInt(element.getAttribute("transform-center-x"), 2);
    const y = parseInt(element.getAttribute("transform-center-y"), 2);
    let transformPoint = new DOMPoint();
    if (Number.isNaN(x) || Number.isNaN(y)) {
      const box = element.getBBox();
      transformPoint = new DOMPoint(
        Number.isNaN(x) ? box.x + box.width / 2 : x,
        Number.isNaN(y) ? box.y + box.height / 2 : y
      );
    } else {
      transformPoint = new DOMPoint(x, y);
    }

    return transformPoint;
  }
}
