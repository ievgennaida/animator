import { AdornerPointType } from "src/app/models/adorner-type";
import { TreeNode } from "src/app/models/tree-node";
import { ICTMProvider } from "../../models/interfaces/ctm-provider";

export interface CalculatedEllipse {
  center: DOMPoint;
  rx: number;
  ry: number;
}

export class Utils {
  static getTreeNodesTitle(nodes: TreeNode[] | null): string {
    const count = nodes?.length || 0;
    if (count === 1 && nodes[0]) {
      return `${nodes[0].name || count}`;
    } else {
      return `nodes (${count})`;
    }
  }
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
  static subtract(point: DOMPoint, point2: DOMPoint): DOMPoint {
    return new DOMPoint(point.x - point2.x, point.y + point2.y);
  }
  static multiplyByPoint(point: DOMPoint, point2: DOMPoint): DOMPoint {
    return new DOMPoint(point.x * point2.x, point.y * point2.y);
  }
  static multiply(point: DOMPoint, value: number): DOMPoint {
    return new DOMPoint(point.x * value, point.y * value);
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
    if (!rect1 || !point || rect1.width === 0 || rect1.height === 0) {
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
    elementPoint: DOMPoint
  ): DOMPoint {
    const current = elementPoint.matrixTransform(el.getScreenCTM());
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
      console.log(`Cannot inverse matrix: ${err || "unknown error"}`);
      return null;
    }
  }

  static isSameParent(nodes: TreeNode[]): boolean {
    if (!nodes) {
      return false;
    }

    let parent: TreeNode | null = null;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (i === 0) {
        parent = node.parentNode;
      }
      if (!node || parent !== node.parentNode) {
        return false;
      }
      parent = node.parentNode;
    }

    return true;
  }
  static addTreeNodeToContainer(
    node: TreeNode,
    container: TreeNode,
    treeIndex: number | null = null,
    htmlIndex: number | null = null
  ) {
    if (!node || !container) {
      throw Error("Node or container cannot be null");
    }

    const element = node.getElement();
    if (!element) {
      throw Error("Node html element cannot be null");
    }
    const parentElement = container.getElement();
    if (!parentElement) {
      throw Error("Node parent html element cannot be null");
    }
    if (htmlIndex !== null && htmlIndex >= 0) {
      const insertBefore = parentElement.children[htmlIndex];
      parentElement.insertBefore(element, insertBefore);
    } else {
      parentElement.appendChild(element);
    }

    if (treeIndex !== null && treeIndex >= 0) {
      Utils.insertElement(container.children, node, treeIndex);
    } else {
      node.parent = container;
      container.children.push(node);
    }
  }
  static deleteTreeNode(node: TreeNode, container: TreeNode | null = null) {
    if (!node) {
      throw Error("Node cannot be null");
    }

    container = container || node.parentNode;
    if (!container) {
      throw Error("Node parent cannot be null");
    }
    const htmlElement = container?.getElement();
    const child = node.getElement();
    htmlElement.removeChild(child);
    Utils.deleteElement(container.children, node);
  }
  static getElementIndex(htmlElement: Element): number {
    const children = htmlElement?.parentElement?.children;
    if (!children) {
      return -1;
    }
    const index = Array.prototype.indexOf.call(children, htmlElement);
    return index;
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

  public static bitwiseEquals(a: AdornerPointType, b: AdornerPointType) {
    // tslint:disable-next-line: no-bitwise
    return (a & b) === b;
  }
  /**
   * This is the top-left relative matrix to the SVG element.
   */
  public static getCTM(element: SVGElement | any): DOMMatrix {
    if (!element) {
      return null;
    }
    return element.getCTM();
  }

  public static insertElement<T>(array: T[], element: T, index: number): T[] {
    return array.splice(index, 0, element);
  }
  public static distinctElement<T>(array: T[]): T[] {
    if (!array) {
      return array;
    }
    const unique: T[] = [];
    array.forEach((p) => {
      if (!unique.includes(p)) {
        unique.push(p);
      }
    });

    return unique;
  }

  public static deleteElement<T>(array: T[], element: T): T[] {
    const index: number = array.indexOf(element);
    if (index !== -1) {
      array.splice(index, 1);
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
    const mag = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
    if (mag === 0) {
      return vector;
    }
    vector.x /= mag;
    vector.y /= mag;
    return vector;
  }
  static getPointAtLength(a: DOMPoint, b: DOMPoint, pos: number): DOMPoint {
    const fraction = pos / Utils.getDistance(a, b);
    const newDeltaX = (b.x - a.x) * fraction;
    const newDeltaY = (b.y - a.y) * fraction;
    return new DOMPoint(a.x + newDeltaX, a.y + newDeltaY);
  }

  static getDistance(a: DOMPoint | null, b: DOMPoint | null): number {
    if (!a || !b) {
      return 0;
    }
    const leng = Math.sqrt(
      Math.pow(a.x - (b ? b.x : 0), 2) + Math.pow(a.y - (b ? b.y : 0), 2)
    );
    return leng;
  }
  static getABDistance(a: number, b: number) {
    return Math.abs(a - b);
  }
  static getRectCenter(rect: DOMRect, relative = false): DOMPoint | null {
    if (!rect) {
      return null;
    }
    if (relative) {
      return new DOMPoint(rect.width / 2, rect.height / 2);
    } else {
      return new DOMPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    }
  }

  /**
   * Check whether element is visible vertically.
   */
  public static isVisibleVertically(el: HTMLElement, container: HTMLElement) {
    if (
      !el ||
      !el.getBoundingClientRect ||
      !container ||
      !container.getBoundingClientRect
    ) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const parentRect = container.getBoundingClientRect();
    if (!parentRect) {
      return;
    }
    // Contains fully or partially:
    if (
      (rect.top > parentRect.top && rect.top < parentRect.bottom) ||
      (rect.bottom > parentRect.top && rect.bottom < parentRect.bottom)
    ) {
      return true;
    }
    return false;
  }
}
