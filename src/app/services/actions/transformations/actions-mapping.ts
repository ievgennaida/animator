import { Type } from "@angular/core";
import { SVGElementType } from "src/app/services/svg/svg-element-type";
import { BaseTransformAction } from "./base-transform-action";
import { PathRotateAction } from "./rotate/path-rotate-action";
import { EllipseScaleAction } from "./scale/ellipse-scale-action";
import { PathScaleAction } from "./scale/path-scale-action";
import { RectScaleAction } from "./scale/rect-scale-action";
import { CircleTransformAction } from "./translate/circle-translate-action";
import { EllipseTransformAction } from "./translate/ellipse-translate-action";
import { PathTranslateAction } from "./translate/path-translate-action";
import { RectTranslateAction } from "./translate/rect-translate-action";
import { TextTranslateAction } from "./translate/text-translate-action";

/**
 * List of the available scale actions for the different elements.
 * Matrix transform is default for all the elements.
 */
export const scaleActions = new Map<
  SVGElementType | string,
  Type<BaseTransformAction>
>();

scaleActions.set(SVGElementType.rect, RectScaleAction);
scaleActions.set(SVGElementType.circle, RectScaleAction);
scaleActions.set(SVGElementType.ellipse, EllipseScaleAction);
scaleActions.set(SVGElementType.path, PathScaleAction);

export const translateActions = new Map<
  SVGElementType | string,
  Type<BaseTransformAction>
>();

translateActions.set(SVGElementType.rect, RectTranslateAction);
translateActions.set(SVGElementType.circle, CircleTransformAction);
translateActions.set(SVGElementType.ellipse, EllipseTransformAction);
translateActions.set(SVGElementType.text, TextTranslateAction);
translateActions.set(SVGElementType.textpath, TextTranslateAction);
translateActions.set(SVGElementType.tspan, TextTranslateAction);
translateActions.set(SVGElementType.path, PathTranslateAction);

export const rotateActions = new Map<
  SVGElementType | string,
  Type<BaseTransformAction>
>();
rotateActions.set(SVGElementType.path, PathRotateAction);

export const skewActions = new Map<
  SVGElementType | string,
  Type<BaseTransformAction>
>();
