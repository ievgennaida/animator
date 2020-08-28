import { HandleData } from "src/app/models/handle-data";
import { RectTransform } from "./rect-transform";

export class TextTransform extends RectTransform {
  beginHandleTransformation(screenPos: DOMPoint, handle: HandleData) {
    super.beginHandleTransformation(screenPos, handle);
    const element = this.getElement();
    this.initBBox = element.getBBox();
  }
  /**
   * get parent text element.
   * override
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
   * override
   */
  transformHandle(screenPos: DOMPoint): boolean {
    return this.scaleByMouse(screenPos);
  }
}
