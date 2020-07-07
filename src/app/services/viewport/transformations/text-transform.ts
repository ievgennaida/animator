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
    const currentElement = super.getElement();

    if (currentElement && currentElement.nodeName === "textPath") {
      const textNode = currentElement.parentNode;
      if (textNode.nodeName === "text") {
        return textNode as SVGGraphicsElement;
      }
    }
    return currentElement;
  }
  /**
   * get parent text element.
   * @override
   */
  transformHandle(screenPos: DOMPoint) {
    this.scaleByMouse(screenPos);
  }
}
