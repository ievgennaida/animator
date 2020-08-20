import { IBBox } from "../../models/interfaces/bbox";
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
  ): DOMPoint {
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

  static matrixRectTransform(rect: DOMRect, matrix: DOMMatrix): DOMRect | null {
    if (!rect || !matrix) {
      return null;
    }
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
    let minX;
    let maxX;
    let minY;
    let maxY;

    for (const rect of rects) {
      if (!rect) {
        continue;
      }
      const size = rect;

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
    if (
      minX === undefined ||
      maxX === undefined ||
      minY === undefined ||
      maxY === undefined
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
  static getCenterTransform(
    element: SVGGraphicsElement,
    bboxCache: DOMRect = null
  ): DOMPoint {
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
