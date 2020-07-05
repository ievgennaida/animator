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
    const handle = this.handle.handles;
    if (Utils.bitwiseEquals(handle, AdornerType.BottomRight)) {
      this.setY(this.initBBox.y + offset.y);
      this.setX(this.initBBox.x + offset.x);
      this.setSizeX(this.initBBox.width + offset.x);
      this.setSizeY(this.initBBox.height + offset.y);
    } else if (Utils.bitwiseEquals(handle, AdornerType.BottomCenter)) {
      this.setY(this.initBBox.y + offset.y);
      this.setSizeY(this.initBBox.height + offset.y);
    } else if (Utils.bitwiseEquals(handle, AdornerType.RightCenter)) {
      this.setX(this.initBBox.x + offset.x);
      this.setSizeX(this.initBBox.width + offset.x);
    } else if (Utils.bitwiseEquals(handle, AdornerType.TopLeft)) {
      this.setY(this.initBBox.y + offset.y);
      this.setX(this.initBBox.x + offset.x);
      this.setSizeX(this.initBBox.width - offset.x);
      this.setSizeY(this.initBBox.height - offset.y);
    } else if (Utils.bitwiseEquals(handle, AdornerType.TopCenter)) {
      this.setY(this.initBBox.y + offset.y);
      this.setSizeY(this.initBBox.height - offset.y);
    } else if (Utils.bitwiseEquals(handle, AdornerType.TopRight)) {
      this.setX(this.initBBox.x + offset.x);
      this.setY(this.initBBox.y + offset.y);
      this.setSizeY(this.initBBox.height - offset.y);
      this.setSizeX(this.initBBox.width + offset.x);
    } else if (Utils.bitwiseEquals(handle, AdornerType.LeftCenter)) {
      this.setX(this.initBBox.x + offset.x);
      this.setSizeX(this.initBBox.width - offset.x);
    } else if (Utils.bitwiseEquals(handle, AdornerType.BottomLeft)) {
      this.setX(this.initBBox.x + offset.x);
      this.setY(this.initBBox.y + offset.y);
      this.setSizeX(this.initBBox.width - offset.x);
      this.setSizeY(this.initBBox.height + offset.y);
    }
    this.transformsService.emitTransformed(element);
  }
}
