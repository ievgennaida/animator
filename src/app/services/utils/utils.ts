import { TreeNode } from "src/app/models/tree-node";
import { PathData } from "./path-data";

export class Utils {
  static getVector(a: DOMPoint, b: DOMPoint = null): DOMPoint {
    const vector = new DOMPoint(a.x - b.x, a.y - b.y);
    return vector;
  }
  static inRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }
  static rectIntersectPoint(rect1: DOMRect, point: DOMPoint): boolean {
    if (!rect1 || !point) {
      return false;
    }

    const overlap =
      Utils.inRange(point.x, rect1.x, rect1.x + rect1.width) &&
      Utils.inRange(point.y, rect1.y, rect1.y + rect1.height);
    return overlap;
  }
  static rectsIntersect(rect1: DOMRect, rect2: DOMRect): boolean {
    if (!rect1 || !rect2) {
      return false;
    }

    const xOverlap =
      Utils.inRange(rect1.x, rect2.x, rect2.x + rect2.width) ||
      Utils.inRange(rect2.x, rect1.x, rect1.x + rect1.width);

    const yOverlap =
      Utils.inRange(rect1.y, rect2.y, rect2.y + rect2.height) ||
      Utils.inRange(rect2.y, rect1.y, rect1.y + rect1.height);

    return xOverlap && yOverlap;
  }

  static deg(rad: number): number {
    return ((rad % 360) * Math.PI) / 180;
  }
  /**
   * https://stackoverflow.com/a/11467200/39428
   */
  static ellipseCenter(
    x1: number,
    y1: number,
    rx: number,
    ry: number,
    rotateDeg: number,
    fa: number,
    fs: number,
    x2: number,
    y2: number
  ): DOMPoint {
    const phi = Utils.deg(rotateDeg);
    const m = new DOMMatrix([
      Math.cos(phi),
      -Math.sin(phi),
      Math.sin(phi),
      Math.cos(phi),
      0,
      0,
    ]);
    let v = new DOMPoint((x1 - x2) / 2, (y1 - y2) / 2).matrixTransform(m);
    const x1p = v.x;
    const y1p = v.y;
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
    if (lambda > 1) {
      rx = Math.sqrt(lambda) * rx;
      ry = Math.sqrt(lambda) * ry;
    }
    const sign = fa === fs ? -1 : 1;
    const div =
      (rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p) /
      (rx * rx * y1p * y1p + ry * ry * x1p * x1p);

    const co = sign * Math.sqrt(Math.abs(div));

    // inverse matrix b and c
    m.b *= -1;
    m.c *= -1;
    v = new DOMPoint(
      ((rx * y1p) / ry) * co,
      ((-ry * x1p) / rx) * co
    ).matrixTransform(m);
    v.x += (x1 + x2) / 2;
    v.y += (y1 + y2) / 2;
    return v;
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
  public static deleteElement(array, element) {
    const index: number = array.indexOf(element);
    if (index !== -1) {
      return array.splice(index, 1);
    }
    return array;
  }
  
  private static getBounds(
    clientRect: boolean,
    ...elements: SVGGraphicsElement[] | TreeNode[]
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
  public static getBoundingClientRect(
    ...elements: SVGGraphicsElement[] | TreeNode[]
  ): DOMRect {
    return Utils.getBounds(true, ...elements);
  }
  public static getBBoxBounds(
    ...elements: SVGGraphicsElement[] | TreeNode[]
  ): DOMRect {
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
    if (!element && !bboxCache) {
      return null;
    }

    if (!bboxCache && !element) {
      bboxCache = element.getBBox();
    }

    if (!bboxCache) {
      return null;
    }
    const x = element
      ? parseInt(element.getAttribute("transform-center-x"), 2)
      : 0;
    const y = element
      ? parseInt(element.getAttribute("transform-center-y"), 2)
      : 0;
    let transformPoint = new DOMPoint();
    if (Number.isNaN(x) || Number.isNaN(y)) {
      transformPoint = new DOMPoint(
        Number.isNaN(x) ? bboxCache.x + bboxCache.width / 2 : x,
        Number.isNaN(y) ? bboxCache.y + bboxCache.height / 2 : y
      );
    } else {
      transformPoint = new DOMPoint(x, y);
    }

    return transformPoint;
  }
}
