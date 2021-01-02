import { AdornerPointType, AdornerTypeUtils } from "./adorner-type";

describe("AdornersConversion", () => {
  it("To move adorner", () => {
    expect(
      AdornerTypeUtils.toScaleAdornerType(AdornerPointType.RotateBottomCenter)
    ).toEqual(AdornerPointType.BottomCenter);
    expect(
      AdornerTypeUtils.toScaleAdornerType(AdornerPointType.RotateRightCenter)
    ).toEqual(AdornerPointType.RightCenter);
    expect(
      AdornerTypeUtils.toScaleAdornerType(AdornerPointType.RotateTopRight)
    ).toEqual(AdornerPointType.TopRight);
    expect(AdornerTypeUtils.toScaleAdornerType(AdornerPointType.TopCenter)).toEqual(
      AdornerPointType.TopCenter
    );
  });

  it("To rotate adorner", () => {
    expect(
      AdornerTypeUtils.toRotateAdornerType(AdornerPointType.BottomCenter)
    ).toEqual(AdornerPointType.RotateBottomCenter);
    expect(
      AdornerTypeUtils.toRotateAdornerType(AdornerPointType.RightCenter)
    ).toEqual(AdornerPointType.RotateRightCenter);
    expect(AdornerTypeUtils.toRotateAdornerType(AdornerPointType.TopRight)).toEqual(
      AdornerPointType.RotateTopRight
    );
    expect(
      AdornerTypeUtils.toRotateAdornerType(AdornerPointType.RotateRightCenter)
    ).toEqual(AdornerPointType.RotateRightCenter);
  });
});
