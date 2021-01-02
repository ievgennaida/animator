import { TreeNode } from "src/app/models/tree-node";
import { IBBox } from "../../../models/interfaces/bbox";
import { Utils } from "../../utils/utils";
import {
  AdornerPointType,
  AdornerType,
  AdornerTypeUtils,
} from "./adorner-type";

/**
 * Adorner is a control points container.
 */
export class Adorner implements IBBox {
  points: Map<AdornerPointType, DOMPoint> = new Map<
    AdornerPointType,
    DOMPoint
  >();
  get topCenter(): DOMPoint | null {
    return this.get(AdornerPointType.TopCenter);
  }
  get bottomCenter(): DOMPoint | null {
    return this.get(AdornerPointType.BottomCenter);
  }
  get leftCenter(): DOMPoint | null {
    return this.get(AdornerPointType.LeftCenter);
  }
  get rightCenter(): DOMPoint | null {
    return this.get(AdornerPointType.RightCenter);
  }
  get bottomLeft(): DOMPoint | null {
    return this.get(AdornerPointType.BottomLeft);
  }
  get bottomRight(): DOMPoint | null {
    return this.get(AdornerPointType.BottomRight);
  }
  get topLeft(): DOMPoint | null {
    return this.get(AdornerPointType.TopLeft);
  }
  get width(): number {
    if (!this.topLeft || !this.topRight) {
      return 0;
    }
    return Utils.getLength(this.topLeft, this.topRight);
  }
  get height(): number {
    if (!this.topLeft || !this.bottomLeft) {
      return 0;
    }
    return Utils.getLength(this.topLeft, this.bottomLeft);
  }
  get topRight(): DOMPoint | null {
    return this.get(AdornerPointType.TopRight);
  }

  get translate(): DOMPoint | null {
    return this.get(AdornerPointType.Translate);
  }
  /**
   * Center transform can be null, in this case it's means that it was unchanged.
   */
  get centerTransform(): DOMPoint | null {
    return this.get(AdornerPointType.CenterTransform);
  }
  get center(): DOMPoint | null {
    return this.get(AdornerPointType.Center);
  }

  /**
   * Initialize adorner from rect
   * @param bounds rectangle to decompose.
   */
  static fromDOMRect(rect: DOMRect): Adorner {
    const adorner = new Adorner();
    adorner.setRect(rect);
    return adorner;
  }
  set(key: AdornerPointType, point: DOMPoint): void {
    this.points.set(key, point);
  }

  get(key: AdornerPointType): DOMPoint | null {
    if (this.points && this.points.size > 0) {
      return this.points.get(key);
    }
    return null;
  }

  untransformSelf(): Adorner {
    const values = [];
    this.points.forEach((value, key) => {
      if (value && AdornerTypeUtils.isScaleAdornerType(key)) {
        values.push(value);
      }
    });
    const bounds = Utils.getPointsBounds(...values);
    this.setRect(bounds);
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
        if (maxY === null) {
          maxY = value.y;
          maxX = value.x;
        } else if (value.y > maxY) {
          maxY = value.y;
          maxX = value.x;
        } else if (value.y === maxY && value.x >= maxX) {
          maxY = value.y;
          maxX = value.x;
        }
      }
    });

    return new DOMPoint(maxX + offsetX, maxY + offsetY);
  }
  /**
   * Set new bounds to the rect.
   * @param bounds new rect bounds.
   */
  setRect(bounds: DOMRect): Adorner {
    if (!bounds) {
      return this;
    }
    this.points.set(AdornerPointType.TopLeft, new DOMPoint(bounds.x, bounds.y));
    this.points.set(
      AdornerPointType.TopRight,
      new DOMPoint(bounds.x + bounds.width, bounds.y)
    );
    this.points.set(
      AdornerPointType.BottomRight,
      new DOMPoint(bounds.x + bounds.width, bounds.y + bounds.height)
    );
    this.points.set(
      AdornerPointType.BottomLeft,
      new DOMPoint(bounds.x, bounds.y + bounds.height)
    );

    this.points.set(
      AdornerPointType.TopCenter,
      new DOMPoint(bounds.x + bounds.width / 2, bounds.y)
    );
    this.points.set(
      AdornerPointType.BottomCenter,
      new DOMPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height)
    );
    this.points.set(
      AdornerPointType.LeftCenter,
      new DOMPoint(bounds.x, bounds.y + bounds.height / 2)
    );
    this.points.set(
      AdornerPointType.RightCenter,
      new DOMPoint(bounds.x + bounds.width, bounds.y + bounds.height / 2)
    );
    const center = Utils.getRectCenter(bounds);
    this.points.set(AdornerPointType.Center, center);
    return this;
  }

  setCenterTransform(center: DOMPoint | null) {
    this.points.set(AdornerPointType.CenterTransform, center);
  }
  /**
   * Compose rect back
   */
  getBBox(): DOMRect {
    return new DOMRect(
      this.topLeft.x,
      this.topLeft.y,
      this.bottomRight.x - this.topLeft.x,
      this.bottomRight.y - this.topLeft.y
    );
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
    points: Map<AdornerPointType, DOMPoint>,
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
  /**
   * Screen or element coordinates.
   */
  isScreen = true;
  enabled = true;
  element: Adorner = new Adorner();
  private screenCache: Adorner;

  elementAdorner: Adorner;

  type = AdornerType.TransformedElement;
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
  resetCache() {
    this.screenCache = null;
  }
  /**
   * Set bbox in element coordinates.
   */
  setBBox(rect: DOMRect): Adorner {
    // Reset screen cache:
    this.screenCache = null;
    return this.element.setRect(rect);
  }
  /**
   * Calculate translate handler point position
   */
  calculateTranslatePosition(offsetX: number = 0, offsetY: number = 0) {
    const translate = this.screen.calculateTranslatePosition(
      offsetX || 0,
      offsetY || 0
    );
    this.screen.set(AdornerPointType.Translate, translate);
    this.element.set(
      AdornerPointType.Translate,
      Utils.toElementPoint(this.node, translate)
    );
  }
  setCenterTransform(center: DOMPoint | null) {
    this.element.setCenterTransform(center);
    if (this.screenCache && center && this.node) {
      this.screenCache.setCenterTransform(
        Utils.toScreenPoint(this.node, center)
      );
    }
  }

  setSelected(adornerType: AdornerPointType, selectedState = true) {
    this.selected.set(adornerType, selectedState);
  }
  isSelected(adornerType: AdornerPointType): boolean {
    const value = this.selected.get(adornerType);
    return !!value;
  }
}
