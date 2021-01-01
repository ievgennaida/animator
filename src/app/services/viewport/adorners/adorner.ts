import { TreeNode } from "src/app/models/tree-node";
import { IBBox } from "../../../models/interfaces/bbox";
import { Utils } from "../../utils/utils";
import { AdornerType } from "./adorner-type";

/**
 * Adorner is a control points container.
 */
export class TransformedRect implements IBBox {
  get topCenter(): DOMPoint | null {
    return this.get(AdornerType.TopCenter);
  }
  get bottomCenter(): DOMPoint | null {
    return this.get(AdornerType.BottomCenter);
  }
  get leftCenter(): DOMPoint | null {
    return this.get(AdornerType.LeftCenter);
  }
  get rightCenter(): DOMPoint | null {
    return this.get(AdornerType.RightCenter);
  }
  get bottomLeft(): DOMPoint | null {
    return this.get(AdornerType.BottomLeft);
  }
  get bottomRight(): DOMPoint | null {
    return this.get(AdornerType.BottomRight);
  }
  get topLeft(): DOMPoint | null {
    return this.get(AdornerType.TopLeft);
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
    return this.get(AdornerType.TopRight);
  }
  get centerTransform(): DOMPoint | null {
    return this.get(AdornerType.CenterTransform);
  }
  get center(): DOMPoint | null {
    return this.get(AdornerType.Center);
  }
  points: Map<AdornerType, DOMPoint> = new Map<AdornerType, DOMPoint>();
  /**
   * Initialize adorner from rect
   * @param bounds rectangle to decompose.
   */
  static fromDOMRect(rect: DOMRect): Adorner {
    const adorner = new Adorner();
    adorner.setRect(rect);
    return adorner;
  }
  set(key: AdornerType, point: DOMPoint): void {
    this.points.set(key, point);
  }

  get(key: AdornerType): DOMPoint | null {
    if (this.points && this.points.size > 0) {
      return this.points.get(key);
    }
    return null;
  }

  untransformSelf(): TransformedRect {
    const bounds = Utils.getPointsBounds(...this.points.values());
    this.setRect(bounds);
    return this;
  }
  /**
   * Set new bounds to the rect.
   * @param bounds new rect bounds.
   */
  setRect(bounds: DOMRect) {
    if (!bounds) {
      return this;
    }
    this.points.set(AdornerType.TopLeft, new DOMPoint(bounds.x, bounds.y));
    this.points.set(
      AdornerType.TopRight,
      new DOMPoint(bounds.x + bounds.width, bounds.y)
    );
    this.points.set(
      AdornerType.BottomRight,
      new DOMPoint(bounds.x + bounds.width, bounds.y + bounds.height)
    );
    this.points.set(
      AdornerType.BottomLeft,
      new DOMPoint(bounds.x, bounds.y + bounds.height)
    );

    this.points.set(
      AdornerType.TopCenter,
      new DOMPoint(bounds.x + bounds.width / 2, bounds.y)
    );
    this.points.set(
      AdornerType.BottomCenter,
      new DOMPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height)
    );
    this.points.set(
      AdornerType.LeftCenter,
      new DOMPoint(bounds.x, bounds.y + bounds.height / 2)
    );
    this.points.set(
      AdornerType.RightCenter,
      new DOMPoint(bounds.x + bounds.width, bounds.y + bounds.height / 2)
    );
    const center = Utils.getRectCenter(bounds);
    this.points.set(AdornerType.Center, center);
  }

  setCenterTransform(center: DOMPoint | null) {
    this.points.set(AdornerType.CenterTransform, center);
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
  matrixTransformSelf(m: DOMMatrix): TransformedRect {
    this.points.forEach((adornerPoint, key) => {
      if (adornerPoint) {
        if (m) {
          this.points.set(key, adornerPoint.matrixTransform(m));
        } else {
          this.points.set(key, adornerPoint);
        }
      }
    });
    return this;
  }
}
export enum AdornerMode {
  TransformedElement,
  ElementsBounds,
  Selection,
  PathDataSelection,
}
export class Adorner extends TransformedRect {
  selected: Map<AdornerType, boolean> = new Map<AdornerType, boolean>();
  /**
   * Screen or element coordinates.
   */
  isScreen = true;
  enabled = true;
  mode = AdornerMode.TransformedElement;
  node: TreeNode | null = null;
  public allowResize = true;

  setSelected(adornerType: AdornerType, selectedState = true) {
    this.selected.set(adornerType, selectedState);
  }
  isSelected(adornerType: AdornerType): boolean {
    const value = this.selected.get(adornerType);
    return !!value;
  }
  allowToRotateAdorners(key: AdornerType): boolean {
    return key !== AdornerType.Center && key !== AdornerType.CenterTransform;
  }

  toElements(): Adorner {
    if (!this.isScreen) {
      return this;
    }
    return this.matrixTransform(this.node.getScreenCTM().inverse());
  }
  toScreen(): Adorner {
    if (this.isScreen) {
      return this;
    }
    return this.matrixTransform(this.node.getScreenCTM());
  }

  matrixTransform(m: DOMMatrix): Adorner {
    const cloned = new Adorner();
    cloned.mode = this.mode;
    cloned.node = this.node;
    this.points.forEach((adornerPoint, key) => {
      if (adornerPoint) {
        cloned.set(key, new DOMPoint(adornerPoint.x, adornerPoint.y));
      } else {
        cloned.set(key, null);
      }
    });
    cloned.matrixTransformSelf(m);
    return cloned;
  }
}
