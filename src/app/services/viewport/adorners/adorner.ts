import { TreeNode } from "src/app/models/tree-node";
import { IBBox } from "../../../models/interfaces/bbox";
import { Utils } from "../../utils/utils";
import { AdornerType } from "./adorner-type";

/**
 * Adorner is a control points container.
 */
export class Adorner implements IBBox {
  points: Map<AdornerType, DOMPoint> = new Map<AdornerType, DOMPoint>();
  selected: Map<AdornerType, boolean> = new Map<AdornerType, boolean>();
  isScreen = true;
  node: TreeNode = null;
  public allowResize = true;
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

  setSelected(adornerType: AdornerType, selectedState = true) {
    this.selected.set(adornerType, selectedState);
  }
  isSelected(adornerType: AdornerType): boolean {
    const value = this.selected.get(adornerType);
    return !!value;
  }
  get(p: AdornerType): DOMPoint {
    return this.points.get(p);
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
  /**
   * Initialize adorner from rect
   * @param bounds rectangle to decompose.
   */
  fromRect(bounds: DOMRect) {
    if (!bounds) {
      return;
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

  matrixTransform(m: DOMMatrix): Adorner {
    const cloned = new Adorner();
    cloned.node = this.node;
    this.points.forEach((adornerPoint, key) => {
      if (adornerPoint) {
        if (m) {
          cloned.points.set(key, adornerPoint.matrixTransform(m));
        } else {
          cloned.points.set(key, adornerPoint);
        }
      }
    });
    return cloned;
  }
}
