export class Utils {
  static getVector(a: DOMPoint, b: DOMPoint = null): DOMPoint {
    const vector = new DOMPoint(a.x - b.x, a.y - b.y);
    return vector;
  }

  static shrinkRect(rect: DOMRect, percent: number): DOMRect {
    if (!percent) {
      return rect;
    }

    const offsetX = rect.width * percent;
    const offsetY = rect.height * percent;
    return new DOMRect(
      rect.x - offsetX / 2,
      rect.y - offsetY / 2,
      rect.width + offsetX,
      rect.height + offsetY
    );
  }

  static matrixRectTransform(rect: DOMRect, matrix: DOMMatrix): DOMRect {
    const start = new DOMPoint(rect.x, rect.y).matrixTransform(matrix);
    const end = new DOMPoint(
      rect.x + rect.width,
      rect.y + rect.height
    ).matrixTransform(matrix);

    return new DOMRect(start.x, start.y, end.x - start.x, end.y - start.y);
  }

  static getBoundingClientRect(...elements: SVGGraphicsElement[]): DOMRect {
    return Utils.getBounds(true, ...elements);
  }
  public static getDOMPoint(x: number, y: number): DOMPoint {
    return new DOMPoint(x, y);
  }
  public static RoundTwo(num: number) {
    return Math.round(num * 100) / 100;
  }
  public static setCTM(element: SVGElement | any, matrix: DOMMatrix) {
    const transform = element.ownerSVGElement.createSVGTransform();
    transform.setMatrix(matrix);
    element.transform.baseVal.initialize(transform);
  }

  public static getCTM(element: SVGElement | any): DOMMatrix {
    if (!element) {
      return null;
    }
    return element.getCTM();
  }

  private static getBounds(
    clientRect: boolean,
    ...elements: SVGGraphicsElement[]
  ): DOMRect {
    if (!elements) {
      return null;
    }
    let minX;
    let maxX;
    let minY;
    let maxY;

    for (const element of elements) {
      const size = clientRect
        ? element.getBoundingClientRect()
        : element.getBBox();

      minX = minX === undefined ? size.x : Math.min(minX, size.x);
      maxX =
        maxX === undefined
          ? size.x + size.width
          : Math.max(maxX, size.x + size.width);
      minY = minY === undefined ? size.y : Math.min(minY, size.y);
      maxY =
        maxY === undefined
          ? size.y + size.height
          : Math.max(maxY, size.y + size.height);
    }
    if (minX === undefined) {
      return;
    }

    return new DOMRect(minX, minY, maxX - minX, maxY - minY);
  }

  static getBBoxBounds(...elements: SVGGraphicsElement[]): DOMRect {
    return Utils.getBounds(false, ...elements);
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

  static getCenterPoint(a: DOMPoint, b: DOMPoint): DOMPoint {
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
