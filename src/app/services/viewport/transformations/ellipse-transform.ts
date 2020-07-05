import { RectTransform } from "./rect-transform";
import { Utils } from "../../utils/utils";
import { AdornerType } from "../adorners/adorner-type";

export class EllipseTransform extends RectTransform {
  // override
  transformPropertyX = "cx";
  // override
  transformPropertyY = "cy";
  sizePropertyX = "rx";
  sizePropertyY = "ry";
  transformHandle(screenPos: DOMPoint) {
    const element = this.getElement();
    const offset = Utils.toElementPoint(element, screenPos);
    if (this.start) {
      offset.x -= this.start.x;
      offset.y -= this.start.y;
    }

    offset.x /= 2;
    offset.y /= 2;
    let w = null;
    let h = null;
    let x = null;
    let y = null;
    const handle = this.handle.handles;
    if (Utils.bitwiseEquals(handle, AdornerType.LeftCenter)) {
      w = this.initBBox.width - offset.x;
      if (w < 0) {
        offset.x += w;
        w = 0;
      }
      x = this.initBBox.x + offset.x;
    } else if (Utils.bitwiseEquals(handle, AdornerType.TopLeft)) {
      w = this.initBBox.width - offset.x;
      if (w < 0) {
        offset.x += w;
        w = 0;
      }
      h = this.initBBox.height - offset.y;
      if (h < 0) {
        offset.y += h;
        h = 0;
      }
      y = this.initBBox.y + offset.y;
      x = this.initBBox.x + offset.x;
    } else if (Utils.bitwiseEquals(handle, AdornerType.TopCenter)) {
      h = this.initBBox.height - offset.y;
      if (h < 0) {
        offset.y += h;
        h = 0;
      }
      y = this.initBBox.y + offset.y;
    } else if (Utils.bitwiseEquals(handle, AdornerType.TopRight)) {
      h = this.initBBox.height - offset.y;
      if (h < 0) {
        offset.y += h;
        h = 0;
      }
      w = this.initBBox.width + offset.x;
      if (w < 0) {
        offset.x -= w;
        w = 0;
      }
      x = this.initBBox.x + offset.x;
      y = this.initBBox.y + offset.y;
    } else if (Utils.bitwiseEquals(handle, AdornerType.RightCenter)) {
      w = this.initBBox.width + offset.x;
      if (w < 0) {
        offset.x -= w;
        w = 0;
      }
      x = this.initBBox.x + offset.x;
    } else if (Utils.bitwiseEquals(handle, AdornerType.BottomLeft)) {
      w = this.initBBox.width - offset.x;
      if (w < 0) {
        offset.x += w;
        w = 0;
      }
      h = this.initBBox.height + offset.y;
      if (h < 0) {
        offset.y -= h;
        h = 0;
      }
      x = this.initBBox.x + offset.x;
      y = this.initBBox.y + offset.y;
    } else if (Utils.bitwiseEquals(handle, AdornerType.BottomCenter)) {
      h = this.initBBox.height + offset.y;
      if (h < 0) {
        offset.y -= h;
        h = 0;
      }
      y = this.initBBox.y + offset.y;
    } else if (Utils.bitwiseEquals(handle, AdornerType.BottomRight)) {
      w = this.initBBox.width + offset.x;
      if (w < 0) {
        offset.x -= w;
        w = 0;
      }
      h = this.initBBox.height + offset.y;
      if (h < 0) {
        offset.y -= h;
        h = 0;
      }
      y = this.initBBox.y + offset.y;
      x = this.initBBox.x + offset.x;
    }

    if (w !== null && w < 0) {
      w = 0;
    }
    if (h !== null && h < 0) {
      h = 0;
    }
    if (x !== null && Number.isFinite(x) && !Number.isNaN(x)) {
      this.setX(x);
    }
    if (y !== null && Number.isFinite(y) && !Number.isNaN(y)) {
      this.setY(y);
    }
    // TODO: revert scale
    if (w !== null && Number.isFinite(w) && !Number.isNaN(w)) {
      this.setSizeX(w);
    }

    if (h !== null && Number.isFinite(h) && !Number.isNaN(h)) {
      this.setSizeY(h);
    }
    this.transformsService.emitTransformed(element);
  }
}
