import { Type } from "@angular/core";
import { SVGElementType } from "src/app/services/svg/svg-element-type";
import { BaseTransformAction } from "./base-transform-action";
import { PathRotateAction } from "./rotate/path-rotate-action";
import { EllipseScaleAction } from "./scale/ellipse-scale-action";
import { PathScaleAction } from "./scale/path-scale-action";
import { RectScaleAction } from "./scale/rect-scale-action";
import { MatrixSkewAction } from "./skew/matrix-skew-action";
import { CircleTransformAction } from "./translate/circle-translate-action";
import { EllipseTransformAction } from "./translate/ellipse-translate-action";
import { PathTranslateAction } from "./translate/path-translate-action";
import { RectTranslateAction } from "./translate/rect-translate-action";
import { TextTranslateAction } from "./translate/text-translate-action";

/**
 * List of the available scale actions for the different elements.
 * Matrix transform is default for all the elements.
 */

/**
 * Scale, resize in element coordinates. (ex: can scale only width or height for rect)
 */
export const scaleElementActions = new Map<
  SVGElementType | string,
  Type<BaseTransformAction>
>();

scaleElementActions.set(SVGElementType.rect, RectScaleAction);
scaleElementActions.set(SVGElementType.circle, RectScaleAction);
scaleElementActions.set(SVGElementType.ellipse, EllipseScaleAction);
scaleElementActions.set(SVGElementType.path, PathScaleAction);

/**
 * Scale in screen coordinates by screen rect matrix.
 */
export const scaleActions = new Map<
  SVGElementType | string,
  Type<BaseTransformAction>
>();

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

// rotateActions.set(SVGElementType.rect, MatrixSkewAction);
// rotateActions.set(SVGElementType.circle, MatrixSkewAction);

export const skewActions = new Map<
  SVGElementType | string,
  Type<BaseTransformAction>
>();
