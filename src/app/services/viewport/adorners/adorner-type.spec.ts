import { AdornerType, AdornerTypeUtils } from "./adorner-type";

describe("AdornersConversion", () => {
  it("To move adorner", () => {
    expect(
      AdornerTypeUtils.toMoveAdornerType(AdornerType.RotateBottomCenter)
    ).toEqual(AdornerType.BottomCenter);
    expect(
      AdornerTypeUtils.toMoveAdornerType(AdornerType.RotateRightCenter)
    ).toEqual(AdornerType.RightCenter);
    expect(
      AdornerTypeUtils.toMoveAdornerType(AdornerType.RotateTopRight)
    ).toEqual(AdornerType.TopRight);
    expect(AdornerTypeUtils.toMoveAdornerType(AdornerType.TopCenter)).toEqual(
      AdornerType.TopCenter
    );
  });

  it("To rotate adorner", () => {
    expect(
      AdornerTypeUtils.toRotateAdornerType(AdornerType.BottomCenter)
    ).toEqual(AdornerType.RotateBottomCenter);
    expect(
      AdornerTypeUtils.toRotateAdornerType(AdornerType.RightCenter)
    ).toEqual(AdornerType.RotateRightCenter);
    expect(AdornerTypeUtils.toRotateAdornerType(AdornerType.TopRight)).toEqual(
      AdornerType.RotateTopRight
    );
    expect(
      AdornerTypeUtils.toRotateAdornerType(AdornerType.RotateRightCenter)
    ).toEqual(AdornerType.RotateRightCenter);
  });
});
