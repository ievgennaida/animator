import { Utils } from "../../utils/utils";
import { IBBox } from "../../../models/interfaces/bbox";
import { AdornerType } from "./adorner-type";

export class AdornerData implements IBBox {
  points: Map<AdornerType, DOMPoint> = new Map<AdornerType, DOMPoint>();
  element: SVGGraphicsElement = null;
  invalid = true;
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
  get topRight(): DOMPoint {
    return this.get(AdornerType.TopRight);
  }
  get centerTransform(): DOMPoint {
    return this.get(AdornerType.CenterTransform);
  }
  get center(): DOMPoint {
    return this.get(AdornerType.Center);
  }

  get(p: AdornerType): DOMPoint {
    return this.points.get(p);
  }
  allowToRotateAdorners(key: AdornerType): boolean {
    return key !== AdornerType.Center && key !== AdornerType.CenterTransform;
  }

  invalidate() {
    this.invalid = true;
  }
  update(renderable: SVGGraphicsElement, bounds: DOMRect = null): AdornerData {
    if (!bounds) {
      if (!renderable || !renderable.getBBox) {
        return null;
      }

      bounds = renderable.getBBox();
    }

    this.decomposeRect(bounds);
    this.points.set(
      AdornerType.CenterTransform,
      Utils.getCenterTransform(renderable, bounds)
    );
    return this;
  }
  /**
   * Initialize adorner from rect
   * @param bounds rectangle to decompose.
   */
  decomposeRect(bounds: DOMRect) {
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
    this.points.set(
      AdornerType.Center,
      new DOMPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
    );
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

  matrixTransform(m: DOMMatrix): AdornerData {
    const cloned = new AdornerData();
    cloned.element = this.element;
    this.points.forEach((adornerPoint, key) => {
      if (adornerPoint) {
        cloned.points.set(key, adornerPoint.matrixTransform(m));
      }
    });
    return cloned;
  }
}
