import { Injectable } from "@angular/core";
import { AdornerData } from "./adorner-data";
import { Utils } from '../../utils/utils';
@Injectable({
  providedIn: "root"
})
export class AdornersDataService {
  constructor() {

  }

  getElementAdornerData(renderable: SVGGraphicsElement): AdornerData {
    if (!renderable) {
      return null;
    }
    const screenAdorner = new AdornerData();
    const bounds = renderable.getBBox();
    screenAdorner.topLeft = new DOMPoint(bounds.x, bounds.y);
    screenAdorner.topRight = new DOMPoint(bounds.x + bounds.width, bounds.y);
    screenAdorner.bottomRight = new DOMPoint(
      bounds.x + bounds.width,
      bounds.y + bounds.height
    );
    screenAdorner.bottomLeft = new DOMPoint(bounds.x, bounds.y + bounds.height);

    screenAdorner.topCenter = new DOMPoint(
      bounds.x + bounds.width / 2,
      bounds.y
    );
    screenAdorner.bottomCenter = new DOMPoint(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height
    );
    screenAdorner.leftCenter = new DOMPoint(
      bounds.x,
      bounds.y + bounds.height / 2
    );
    screenAdorner.rightCenter = new DOMPoint(
      bounds.x + bounds.width,
      bounds.y + bounds.height / 2
    );

    screenAdorner.centerTransform = Utils.getCenterTransform(
      renderable,
      bounds
    );
    return screenAdorner;
  }
}
