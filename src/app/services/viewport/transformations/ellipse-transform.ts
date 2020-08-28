import { RectTransform } from "./rect-transform";
import { baseEffect } from "src/app/models/Lottie/effects/baseEffect";

export class EllipseTransform extends RectTransform {
  // override
  transformPropertyX = "cx";
  // override
  transformPropertyY = "cy";
  sizePropertyX = "rx";
  sizePropertyY = "ry";
  protected onReverseScale(rect: DOMRect, startRect: DOMRect): DOMRect {
    // Reverse scaling
    rect.width = Math.abs(rect.width);
    rect.height = Math.abs(rect.height);
    return rect;
  }
}
