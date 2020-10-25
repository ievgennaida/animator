import { ICTMProvider } from "../../models/interfaces/ctm-provider";
import { AdornerType } from "../viewport/adorners/adorner-type";

export interface CalculatedEllipse {
  center: DOMPoint;
  rx: number;
  ry: number;
}

export class Utils {
  static getVector(
    a: DOMPoint,
    b: DOMPoint = null,
    normalized = false
  ): DOMPoint | null {
    if (!a || !b) {
      return null;
    }
    const vector = new DOMPoint(a.x - b.x, a.y - b.y);
    if (normalized) {
      Utils.normalizeSelf(vector);
    }
    return vector;
  }
  /**
   * find point along vector.
   * @param point point.
   * @param vector normalized vector
   * @param steps steps along vector
   */
  static alongVector(
    point: DOMPoint,
    vector: DOMPoint,
    steps: number = 0
  ): DOMPoint {
    return new DOMPoint(point.x + vector.x * steps, point.y + vector.y * steps);
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

  /**
   * Convert deg to radians.
   * @param angle in deg.
   */
  static rad(deg: number): number {
    return ((deg % 360) * Math.PI) / 180;
  }
  /**
   * Convert radians to degrees.
   * @param angle in rad.
   */
  static deg(rad: number): number {
    return (rad * 180) / Math.PI;
  }
  static angle(p1: DOMPoint, p2: DOMPoint): number {
    const rad = Math.atan2(p1.y - p2.y, p2.x - p1.x);
    return Utils.deg(rad);
  }
  static mod(x: number, m: number) {
    return ((x % m) + m) % m;
  }
  static clamp(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max);
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
  ): CalculatedEllipse {
    const phi = Utils.rad(rotateDeg);
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
    return { center: v, rx, ry } as CalculatedEllipse;
  }
  static shrinkRectPercent(rect: DOMRect, percent: number): DOMRect | null {
    if (!rect) {
      return null;
    }
    if (!percent) {
      return rect;
    }

    const offsetX = rect.width * percent;
    const offsetY = rect.height * percent;
    return Utils.shrinkRect(rect, offsetX, offsetY);
  }
  static samePoints(a: DOMPoint, b: DOMPoint, round = 2) {
    if (!a && !b) {
      return true;
    }
    if (a && b) {
      if (
        Utils.round(a.x, round) === Utils.round(b.x) &&
        Utils.round(a.y) === Utils.round(b.y)
      ) {
        return true;
      }
    }

    return false;
  }
  static shrinkRect(
    rect: DOMRect,
    offsetX: number,
    offsetY: number
  ): DOMRect | null {
    if (!rect) {
      return null;
    }
    return new DOMRect(
      rect.x - offsetX / 2,
      rect.y - offsetY / 2,
      rect.width + offsetX,
      rect.height + offsetY
    );
  }
  static keepInBounds(
    size: number,
    maxSize: number,
    minPercent = 0.1,
    maxPercent = 0.9
  ): number {
    const min = maxSize * minPercent;
    const max = maxSize * maxPercent;
    if (size <= min) {
      size = min;
    }

    if (size >= max) {
      size = max;
    }

    return size;
  }
  static toScreenPoint(
    el: SVGGraphicsElement | ICTMProvider,
    screenPoint: DOMPoint
  ): DOMPoint {
    const current = screenPoint.matrixTransform(el.getScreenCTM());
    return current;
  }
  static toElementPoint(
    el: SVGGraphicsElement | ICTMProvider,
    screenPoint: DOMPoint
  ): DOMPoint | null {
    if (!screenPoint) {
      return null;
    }
    const ctm = el.getScreenCTM();
    if (!ctm) {
      return null;
    }
    try {
      const current = screenPoint.matrixTransform(ctm.inverse());
      return current;
    } catch (err) {
      console.log("Cannot inverse matrix:" + err);
      return null;
    }
  }
  /**
   * Get element current transformation matrix.
   * @param element element to get matrix for.
   */
  public static getMatrix(element: SVGGraphicsElement): DOMMatrix | null {
    if (!element) {
      return null;
    }
    return Utils.transformToElement(
      element,
      element.parentNode as SVGGraphicsElement
    );
  }
  public static transformToElement(
    fromElement: SVGGraphicsElement,
    toElement: SVGGraphicsElement
  ): DOMMatrix | null {
    if (!fromElement || !fromElement.getScreenCTM) {
      return null;
    }
    if (!toElement) {
      return fromElement.getScreenCTM();
    }

    const toMatrix = toElement.getScreenCTM();
    const fromMatrix = fromElement.getScreenCTM();
    if (!toMatrix || !fromMatrix) {
      return null;
    }
    return toMatrix.inverse().multiply(fromMatrix);
  }
  /**
   * Set matrix as transform attribute for the element.
   */
  public static setMatrix(element: SVGGraphicsElement, matrix: DOMMatrix) {
    const transform = Utils.getElementTransform(element);
    transform.setMatrix(matrix);
    element.transform.baseVal.initialize(transform);
    return true;
  }
  /**
   * Get Current transforms
   */
  public static getElementTransform(element: SVGGraphicsElement): SVGTransform {
    const transform =
      element.transform.baseVal.consolidate() ||
      element.ownerSVGElement.createSVGTransform();
    return transform;
  }
  /**
   * Transform rectangle by a matrix.
   * @param rect rectangle to transform.
   * @param matrix matrix to transform rectangle.
   * @param recalculateBounds Use when rectangle can be rotated.
   * In this case rotated bounds will be returned.
   */
  public static matrixRectTransform(
    rect: DOMRect,
    matrix: DOMMatrix,
    recalculateBounds = false
  ): DOMRect | null {
    if (!rect || !matrix) {
      return null;
    }
    const topLeft = new DOMPoint(rect.x, rect.y).matrixTransform(matrix);
    const bottomRight = new DOMPoint(
      rect.x + rect.width,
      rect.y + rect.height
    ).matrixTransform(matrix);
    if (recalculateBounds) {
      // We should recalculate bounds for a case when rect was rotated or skewed.
      const topRight = new DOMPoint(
        rect.x + rect.width,
        rect.y
      ).matrixTransform(matrix);
      const bottomLeft = new DOMPoint(
        rect.x,
        rect.y + rect.height
      ).matrixTransform(matrix);
      return Utils.getPointsBounds(topLeft, bottomRight, topRight, bottomLeft);
    } else {
      return new DOMRect(
        topLeft.x,
        topLeft.y,
        bottomRight.x - topLeft.x,
        bottomRight.y - topLeft.y
      );
    }
  }

  /**
   * Get Rect bounds from a list of points.
   * @param points List of points to analyze.
   */
  public static getPointsBounds(...points: DOMPoint[]): DOMRect | null {
    if (!points || points.length === 0) {
      return null;
    }
    let minX: number | null = null;
    let maxX: number | null = null;
    let minY: number | null = null;
    let maxY: number | null = null;
    points.forEach((p) => {
      minX = minX === null ? p.x : Math.min(p.x, minX);
      maxX = maxX === null ? p.x : Math.max(p.x, maxX);

      minY = minY === null ? p.y : Math.min(p.y, minY);
      maxY = maxY === null ? p.y : Math.max(p.y, maxY);
    });
    if (
      minX === null ||
      maxX === null ||
      minY === null ||
      maxY === null ||
      isNaN(minX) ||
      isNaN(maxX) ||
      isNaN(minY) ||
      isNaN(maxY)
    ) {
      return;
    }
    return new DOMRect(
      minX,
      minY,
      Math.max(maxX - minX),
      Math.max(maxY - minY)
    );
  }
  public static getDOMPoint(x: number, y: number): DOMPoint {
    return new DOMPoint(x, y);
  }
  public static round(num: number, factor = 2) {
    let mult = 10;
    if (factor === 2) {
      mult = 100;
    } else {
      for (let i = 1; i <= factor; i++) {
        mult *= 10;
      }
    }

    return Math.round(num * mult) / mult;
  }
  public static setCTM(element: SVGElement | any, matrix: DOMMatrix) {
    const transform = element.ownerSVGElement.createSVGTransform();
    transform.setMatrix(matrix);
    element.transform.baseVal.initialize(transform);
  }
  public static bitwiseEquals(a: AdornerType, b: AdornerType) {
    // tslint:disable-next-line: no-bitwise
    return (a & b) === b;
  }
  public static getCTM(element: SVGElement | any): DOMMatrix {
    if (!element) {
      return null;
    }
    return element.getCTM();
  }
  public static deleteElement<T>(array: Array<T>, element: T) {
    const index: number = array.indexOf(element);
    if (index !== -1) {
      return array.splice(index, 1);
    }
    return array;
  }

  public static mergeRects(...rects: DOMRect[]): DOMRect | null {
    if (!rects) {
      return null;
    }
    let minX: number | null = null;
    let maxX: number | null = null;
    let minY: number | null = null;
    let maxY: number | null = null;

    for (const rect of rects) {
      if (!rect) {
        continue;
      }
      const size = rect;

      minX = minX === null ? size.x : Math.min(minX, size.x);
      maxX =
        maxX === null
          ? size.x + size.width
          : Math.max(maxX, size.x + size.width);
      minY = minY === null ? size.y : Math.min(minY, size.y);
      maxY =
        maxY === null
          ? size.y + size.height
          : Math.max(maxY, size.y + size.height);
    }
    if (
      minX === null ||
      maxX === null ||
      minY === null ||
      maxY === null ||
      isNaN(minX) ||
      isNaN(maxX) ||
      isNaN(minY) ||
      isNaN(maxY)
    ) {
      return;
    }

    return new DOMRect(minX, minY, maxX - minX, maxY - minY);
  }

  public static getBoundingClientRect(
    ...elements: SVGGraphicsElement[]
  ): DOMRect | null {
    if (!elements) {
      return null;
    }
    const rects = elements.map((p) => {
      if (p) {
        return p.getBoundingClientRect() as DOMRect;
      } else {
        return null;
      }
    });
    return Utils.mergeRects(...rects);
  }
  static reverseVector(a: DOMPoint): DOMPoint {
    if (!a) {
      return null;
    }
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

  static normalizeSelf(vector: DOMPoint): DOMPoint {
    const mag = Utils.getLength(vector);
    if (mag === 0) {
      return vector;
    }
    vector.x /= mag;
    vector.y /= mag;
    return vector;
  }
  static getPointAtLength(a: DOMPoint, b: DOMPoint, pos: number): DOMPoint {
    const fraction = pos / Utils.getLength(a, b);
    const newDeltaX = (b.x - a.x) * fraction;
    const newDeltaY = (b.y - a.y) * fraction;
    return new DOMPoint(a.x + newDeltaX, a.y + newDeltaY);
  }

  static getLength(a: DOMPoint, b: DOMPoint = null): number {
    const leng = Math.sqrt(
      Math.pow(a.x - (b ? b.x : 0), 2) + Math.pow(a.y - (b ? b.y : 0), 2)
    );
    return leng;
  }
  static getDistance(x1: number, y1: number, x2?: number, y2?: number) {
    if (x2 !== undefined && y2 !== undefined) {
      return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    } else {
      return Math.abs(x1 - y1);
    }
  }
  static getRectCenter(rect: DOMRect): DOMPoint | null {
    if (!rect) {
      return null;
    }
    return new DOMPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
  }
  static getCenterTransform(
    element: SVGGraphicsElement,
    bboxCache: DOMRect = null
  ): DOMPoint | null {
    if (!element && !bboxCache) {
      return null;
    }

    if (!bboxCache && element) {
      bboxCache = element.getBBox();
    }

    if (!bboxCache) {
      return null;
    }
    const x = element
      ? parseInt(element.getAttribute("transform-center-x"), 2)
      : null;
    const y = element
      ? parseInt(element.getAttribute("transform-center-y"), 2)
      : null;
    const rectCenter = Utils.getRectCenter(bboxCache);
    const transformPoint = new DOMPoint(
      isNaN(x) ? (rectCenter ? rectCenter.x : 0) : x,
      isNaN(y) ? (rectCenter ? rectCenter.y : 0) : y
    );
    return transformPoint;
  }
}
