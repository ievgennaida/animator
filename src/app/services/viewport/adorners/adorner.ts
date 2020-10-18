import { TreeNode } from "src/app/models/tree-node";
import { IBBox } from "../../../models/interfaces/bbox";
import { Utils } from "../../utils/utils";
import { AdornerType } from "./adorner-type";

/**
 * Adorner is a control points container.
 */
export class TransformedRect implements IBBox {
  get topCenter(): DOMPoint {
    return this.get(AdornerType.TopCenter);
  }
  get bottomCenter(): DOMPoint {
    return this.get(AdornerType.BottomCenter);
  }
  get leftCenter(): DOMPoint {
    return this.get(AdornerType.LeftCenter);
  }
  get rightCenter(): DOMPoint {
    return this.get(AdornerType.RightCenter);
  }
  get bottomLeft(): DOMPoint {
    return this.get(AdornerType.BottomLeft);
  }
  get bottomRight(): DOMPoint {
    return this.get(AdornerType.BottomRight);
  }
  get topLeft(): DOMPoint {
    return this.get(AdornerType.TopLeft);
  }
  get width(): number {
    return Utils.getLength(this.topLeft, this.topRight);
  }
  get height(): number {
    return Utils.getLength(this.topLeft, this.bottomLeft);
  }
  get topRight(): DOMPoint {
    return this.get(AdornerType.TopRight);
  }
  get centerTransform(): DOMPoint {
    return this.get(AdornerType.CenterTransform);
  }
  get center(): DOMPoint {
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

  get(key: AdornerType): DOMPoint {
    return this.points.get(key);
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
    // Transform around this point.
    this.setCenterTransform(center);
  }

  setCenterTransform(center: DOMPoint) {
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
  PathDataSelection
}
export class Adorner extends TransformedRect {
  selected: Map<AdornerType, boolean> = new Map<AdornerType, boolean>();
  /**
   * Screen or element coordinates.
   */
  isScreen = true;

  mode = AdornerMode.TransformedElement;
  node: TreeNode = null;
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
      cloned.set(key, new DOMPoint(adornerPoint.x, adornerPoint.y));
    });
    cloned.matrixTransformSelf(m);
    return cloned;
  }
}
