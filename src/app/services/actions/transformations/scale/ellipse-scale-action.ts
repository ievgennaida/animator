import { Injectable } from "@angular/core";
import { RectScaleAction } from "./rect-scale-action";

@Injectable({
  providedIn: "root",
})
export class EllipseScaleAction extends RectScaleAction {
  // override
  propX = "cx";
  // override
  propY = "cy";
  sizePropertyX = "rx";
  sizePropertyY = "ry";
  protected onReverseScale(rect: DOMRect): DOMRect {
    // Reverse scaling
    rect.width = Math.abs(rect.width);
    rect.height = Math.abs(rect.height);
    return rect;
  }
}
