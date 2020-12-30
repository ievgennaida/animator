import { Injectable } from "@angular/core";
import { EllipseTransformAction } from "./ellipse-translate-action";

/**
 * Translate operation for the circle.
 */
@Injectable({
  providedIn: "root",
})
export class CircleTransformAction extends EllipseTransformAction {}
