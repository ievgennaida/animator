import { AdornerPointType } from "./adorner-point-type";
import { AdornerTypeUtils } from "./adorner-type-utils";

describe("AdornersConversion", () => {
  it("To move adorner", () => {
    expect(
      AdornerTypeUtils.toScaleAdornerType(AdornerPointType.rotateBottomCenter)
    ).toEqual(AdornerPointType.bottomCenter);
    expect(
      AdornerTypeUtils.toScaleAdornerType(AdornerPointType.rotateRightCenter)
    ).toEqual(AdornerPointType.rightCenter);
    expect(
      AdornerTypeUtils.toScaleAdornerType(AdornerPointType.rotateTopRight)
    ).toEqual(AdornerPointType.topRight);
    expect(
      AdornerTypeUtils.toScaleAdornerType(AdornerPointType.topCenter)
    ).toEqual(AdornerPointType.topCenter);
  });

  it("To rotate adorner", () => {
    expect(
      AdornerTypeUtils.toRotateAdornerType(AdornerPointType.bottomCenter)
    ).toEqual(AdornerPointType.rotateBottomCenter);
    expect(
      AdornerTypeUtils.toRotateAdornerType(AdornerPointType.rightCenter)
    ).toEqual(AdornerPointType.rotateRightCenter);
    expect(
      AdornerTypeUtils.toRotateAdornerType(AdornerPointType.topRight)
    ).toEqual(AdornerPointType.rotateTopRight);
    expect(
      AdornerTypeUtils.toRotateAdornerType(AdornerPointType.rotateRightCenter)
    ).toEqual(AdornerPointType.rotateRightCenter);
  });
});
