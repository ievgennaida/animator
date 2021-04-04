import { TreeNode } from "src/app/models/tree-node";
import { Utils } from "../services/utils/utils";
import { AdornerPointType } from "./adorner-point-type";
import { AdornerType } from "./adorner-type";
import { AdornerTypeUtils } from "./adorner-type-utils";
import { IBBox } from "./interfaces/bbox";

/**
 * Adorner is a control points container.
 */
export class Adorner implements IBBox {
  points = new Map<AdornerPointType, DOMPoint | null>();
  get topCenter(): DOMPoint | null {
    return this.get(AdornerPointType.topCenter);
  }
  get bottomCenter(): DOMPoint | null {
    return this.get(AdornerPointType.bottomCenter);
  }
  get leftCenter(): DOMPoint | null {
    return this.get(AdornerPointType.leftCenter);
  }
  get rightCenter(): DOMPoint | null {
    return this.get(AdornerPointType.rightCenter);
  }
  get bottomLeft(): DOMPoint | null {
    return this.get(AdornerPointType.bottomLeft);
  }
  get bottomRight(): DOMPoint | null {
    return this.get(AdornerPointType.bottomRight);
  }
  get topLeft(): DOMPoint | null {
    return this.get(AdornerPointType.topLeft);
  }
  get width(): number {
    if (!this.topLeft || !this.topRight) {
      return 0;
    }
    return Utils.getDistance(this.topLeft, this.topRight);
  }
  get height(): number {
    if (!this.topLeft || !this.bottomLeft) {
      return 0;
    }
    return Utils.getDistance(this.topLeft, this.bottomLeft);
  }
  get topRight(): DOMPoint | null {
    return this.get(AdornerPointType.topRight);
  }

  get translate(): DOMPoint | null {
    return this.get(AdornerPointType.translate);
  }
  /**
   * Center transform can be null, in this case it's means that it was unchanged.
   */
  get centerTransform(): DOMPoint | null {
    return this.get(AdornerPointType.centerTransform);
  }
  get center(): DOMPoint | null {
    return this.get(AdornerPointType.center);
  }

  /**
   * Initialize adorner from rect
   *
   * @param bounds rectangle to decompose.
   */
  static fromDOMRect(rect: DOMRect): Adorner {
    const adorner = new Adorner();
    adorner.setRect(rect);
    return adorner;
  }
  getCenterTransformOrDefault(): DOMPoint | null {
    return this.centerTransform || this.center || null;
  }
  set(key: AdornerPointType, point: DOMPoint | null): void {
    this.points.set(key, point);
  }

  get(key: AdornerPointType): DOMPoint | null {
    if (this.points && this.points.size > 0) {
      return this.points.get(key) || null;
    }
    return null;
  }

  untransformSelf(): Adorner {
    const values: DOMPoint[] = [];
    this.points.forEach((value, key) => {
      if (value && AdornerTypeUtils.isScaleAdornerType(key)) {
        values.push(value);
      }
    });
    const bounds = Utils.getPointsBounds(...values);
    if (bounds) {
      this.setRect(bounds);
    }
    return this;
  }
  calculateTranslatePosition(
    offsetX: number = 0,
    offsetY: number = 0
  ): DOMPoint | null {
    let maxX: number | null = null;
    let maxY: number | null = null;
    this.points.forEach((value, key) => {
      if (value && AdornerTypeUtils.isScaleAdornerType(key)) {
        if (maxY === null || maxX === null) {
          maxY = value.y;
          maxX = value.x;
        } else if (Utils.round(value.y, 0) > Utils.round(maxY, 0)) {
          maxY = value.y;
          maxX = value.x;
        } else if (
          Utils.round(value.y, 0) === Utils.round(maxY, 0) &&
          Utils.round(value.x, 0) > Utils.round(maxX, 0)
        ) {
          maxY = value.y;
          maxX = value.x;
        }
      }
    });

    return new DOMPoint((maxX || 0) + offsetX, (maxY || 0) + offsetY);
  }
  /**
   * Set new bounds to the rect.
   *
   * @param bounds new rect bounds.
   */
  setRect(bounds: DOMRect | null): Adorner {
    if (!bounds) {
      return this;
    }
    this.points.set(AdornerPointType.topLeft, new DOMPoint(bounds.x, bounds.y));
    this.points.set(
      AdornerPointType.topRight,
      new DOMPoint(bounds.x + bounds.width, bounds.y)
    );
    this.points.set(
      AdornerPointType.bottomRight,
      new DOMPoint(bounds.x + bounds.width, bounds.y + bounds.height)
    );
    this.points.set(
      AdornerPointType.bottomLeft,
      new DOMPoint(bounds.x, bounds.y + bounds.height)
    );

    this.points.set(
      AdornerPointType.topCenter,
      new DOMPoint(bounds.x + bounds.width / 2, bounds.y)
    );
    this.points.set(
      AdornerPointType.bottomCenter,
      new DOMPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height)
    );
    this.points.set(
      AdornerPointType.leftCenter,
      new DOMPoint(bounds.x, bounds.y + bounds.height / 2)
    );
    this.points.set(
      AdornerPointType.rightCenter,
      new DOMPoint(bounds.x + bounds.width, bounds.y + bounds.height / 2)
    );
    const center = Utils.getRectCenter(bounds);
    this.points.set(AdornerPointType.center, center);
    return this;
  }

  setCenterTransform(center: DOMPoint | null): void {
    this.points.set(AdornerPointType.centerTransform, center);
  }
  /**
   * Compose rect back
   */
  getBBox(): DOMRect | null {
    if (this.topLeft && this.bottomRight) {
      return new DOMRect(
        this.topLeft.x,
        this.topLeft.y,
        this.bottomRight.x - this.topLeft.x,
        this.bottomRight.y - this.topLeft.y
      );
    }
    return null;
  }

  /**
   * Cloned adorner transformed.
   */
  matrixTransform(m: DOMMatrix): Adorner {
    const cloned = new Adorner();
    cloned.setPoints(this.points, m);
    return cloned;
  }

  setPoints(
    points: Map<AdornerPointType, DOMPoint | null>,
    matrix: DOMMatrix | null = null
  ): Adorner {
    this.points.clear();

    points.forEach((adornerPoint, key) => {
      if (matrix && adornerPoint) {
        this.points.set(key, adornerPoint.matrixTransform(matrix));
      } else {
        this.points.set(key, adornerPoint);
      }
    });
    return this;
  }

  matrixTransformSelf(m: DOMMatrix): Adorner {
    this.points.forEach((adornerPoint, key) => {
      if (m && adornerPoint) {
        this.points.set(key, adornerPoint.matrixTransform(m));
      } else {
        this.points.set(key, adornerPoint);
      }
    });
    return this;
  }
}

export class AdornerContainer {
  selected: Map<AdornerPointType, boolean> = new Map<
    AdornerPointType,
    boolean
  >();

  enabled = true;
  element: Adorner = new Adorner();
  elementAdorner: Adorner | null = null;
  showHandles = true;
  showBounds = true;
  type = AdornerType.transformedElement;
  node: TreeNode | null = null;

  get screen(): Adorner | null {
    if (!this.node) {
      return null;
    }
    if (this.screenCache) {
      return this.screenCache;
    }
    this.screenCache = new Adorner();
    this.screenCache.setPoints(this.element.points, this.node.getScreenCTM());
    return this.screenCache;
  }
  private screenCache: Adorner | null = null;

  resetCache(): void {
    this.screenCache = null;
  }
  /**
   * Set bbox in element coordinates.
   */
  setBBox(rect: DOMRect | null): Adorner {
    // Reset screen cache:
    this.screenCache = null;
    return this.element.setRect(rect);
  }
  /**
   * Calculate translate handler point position
   */
  calculateTranslatePosition(offsetX: number = 0, offsetY: number = 0): void {
    if (!this.screen || !this.node) {
      console.log("Cannot calculate, node or screen should be set");
      return;
    }
    const translate = this.screen.calculateTranslatePosition(
      offsetX || 0,
      offsetY || 0
    );
    this.screen.set(AdornerPointType.translate, translate);
    const elementPoint = Utils.toElementPoint(this.node, translate);
    this.element.set(AdornerPointType.translate, elementPoint);
  }
  setCenterTransform(center: DOMPoint | null): void {
    this.element.setCenterTransform(center);
    if (this.screenCache && center && this.node) {
      this.screenCache.setCenterTransform(
        Utils.toScreenPoint(this.node, center)
      );
    }
  }

  setSelected(adornerType: AdornerPointType, selectedState = true): void {
    this.selected.set(adornerType, selectedState);
  }
  isSelected(adornerType: AdornerPointType): boolean {
    const value = this.selected.get(adornerType);
    return !!value;
  }
}
