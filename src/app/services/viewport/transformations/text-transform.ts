import { RectTransform } from "./rect-transform";
import { HandleData } from "src/app/models/handle-data";

export class TextTransform extends RectTransform {
  beginHandleTransformation(handle: HandleData, screenPos: DOMPoint) {
    super.beginHandleTransformation(handle, screenPos);
    const element = this.getElement();
    this.initBBox = element.getBBox();
  }
  /**
   * get parent text element.
   * @override
   */
  getElement(): SVGGraphicsElement {
    if (this.element && this.element.nodeName === "textPath") {
      const textNode = this.element.parentNode;
      if (textNode.nodeName === "text") {
        return textNode as SVGGraphicsElement;
      }
    }
    return this.element;
  }
  /**
   * get parent text element.
   * @override
   */
  transformHandle(screenPos: DOMPoint) {
    this.scaleByMouse(screenPos);
  }
}
