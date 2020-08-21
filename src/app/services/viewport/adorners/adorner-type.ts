// tslint:disable: no-bitwise
// Bitwise
export enum AdornerType {
  None = 0,

  TopLeft = 1 << 0,
  TopCenter = 1 << 1,
  TopRight = 1 << 2,
  BottomLeft = 1 << 3,
  BottomCenter = 1 << 4,
  BottomRight = 1 << 5,
  LeftCenter = 1 << 6,
  RightCenter = 1 << 7,
  /**
   * Center of the transformation to be applied.
   */
  CenterTransform = 1 << 8,
  /**
   * Center of the adorner.
   */
  Center = 1 << 9,
  RotateTopLeft = 1 << 10,
  RotateTopCenter = 1 << 11,
  RotateTopRight = 1 << 12,
  RotateBottomLeft = 1 << 13,
  RotateBottomCenter = 1 << 14,
  RotateBottomRight = 1 << 15,
  RotateLeftCenter = 1 << 16,
  RotateRightCenter = 1 << 17,
}

export class AdornerTypeUtils {
  static isRotateAdornerType(data: AdornerType): boolean {
    return data > AdornerType.Center;
  }
  static toMoveAdornerType(key: AdornerType): AdornerType {
    if (key <= AdornerType.Center) {
      return key;
    } else {
      return key / AdornerType.Center / 2;
    }
  }

  static toRotateAdornerType(key: AdornerType): AdornerType {
    if (key > AdornerType.Center) {
      return key;
    } else {
      return key * AdornerType.Center * 2;
    }
  }
}
