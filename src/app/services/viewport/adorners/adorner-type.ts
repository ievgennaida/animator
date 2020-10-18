// tslint:disable: no-bitwise

import { Utils } from "../../utils/utils";

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
  /**
   * Get opposite adorner side if any.
   */
  static getOpposite(handle: AdornerType): AdornerType {
    if (Utils.bitwiseEquals(handle, AdornerType.RotateTopLeft)) {
      return AdornerType.RotateBottomRight;
    } else if (Utils.bitwiseEquals(handle, AdornerType.RotateTopCenter)) {
      return AdornerType.RotateBottomCenter;
    } else if (Utils.bitwiseEquals(handle, AdornerType.RotateTopRight)) {
      return AdornerType.RotateBottomLeft;
    } else if (Utils.bitwiseEquals(handle, AdornerType.RotateBottomLeft)) {
      return AdornerType.RotateTopRight;
    } else if (Utils.bitwiseEquals(handle, AdornerType.RotateBottomCenter)) {
      return AdornerType.RotateTopCenter;
    } else if (Utils.bitwiseEquals(handle, AdornerType.RotateBottomRight)) {
      return AdornerType.RotateTopLeft;
    } else if (Utils.bitwiseEquals(handle, AdornerType.RotateLeftCenter)) {
      return AdornerType.RotateRightCenter;
    } else if (Utils.bitwiseEquals(handle, AdornerType.RotateRightCenter)) {
      return AdornerType.RotateLeftCenter;
    }

    if (Utils.bitwiseEquals(handle, AdornerType.TopLeft)) {
      return AdornerType.BottomRight;
    } else if (Utils.bitwiseEquals(handle, AdornerType.TopCenter)) {
      return AdornerType.BottomCenter;
    } else if (Utils.bitwiseEquals(handle, AdornerType.TopRight)) {
      return AdornerType.BottomLeft;
    } else if (Utils.bitwiseEquals(handle, AdornerType.BottomLeft)) {
      return AdornerType.TopRight;
    } else if (Utils.bitwiseEquals(handle, AdornerType.BottomCenter)) {
      return AdornerType.TopCenter;
    } else if (Utils.bitwiseEquals(handle, AdornerType.BottomRight)) {
      return AdornerType.TopLeft;
    } else if (Utils.bitwiseEquals(handle, AdornerType.LeftCenter)) {
      return AdornerType.RightCenter;
    } else if (Utils.bitwiseEquals(handle, AdornerType.RightCenter)) {
      return AdornerType.LeftCenter;
    }

    return handle;
  }
  /**
   * Get DOM react point by the adorner position.
   * @param bounds rect bounds.
   * @param handle adorner type.
   */
  static getRectPoint(bounds: DOMRect, handle: AdornerType): DOMPoint {
    const transformPoint = new DOMPoint(bounds.x, bounds.y);

    if (
      Utils.bitwiseEquals(handle, AdornerType.TopLeft) ||
      Utils.bitwiseEquals(handle, AdornerType.RotateTopLeft)
    ) {
      return transformPoint;
    } else if (
      Utils.bitwiseEquals(handle, AdornerType.TopCenter) ||
      Utils.bitwiseEquals(handle, AdornerType.RotateTopCenter)
    ) {
      transformPoint.x = bounds.x + bounds.width / 2;
    } else if (
      Utils.bitwiseEquals(handle, AdornerType.TopRight) ||
      Utils.bitwiseEquals(handle, AdornerType.RotateTopRight)
    ) {
      transformPoint.x = bounds.x + bounds.width;
    } else if (
      Utils.bitwiseEquals(handle, AdornerType.BottomLeft) ||
      Utils.bitwiseEquals(handle, AdornerType.RotateBottomLeft)
    ) {
      transformPoint.x = bounds.x;
      transformPoint.y = bounds.y + bounds.height;
    } else if (
      Utils.bitwiseEquals(handle, AdornerType.BottomCenter) ||
      Utils.bitwiseEquals(handle, AdornerType.RotateBottomCenter)
    ) {
      transformPoint.x = bounds.x + bounds.width / 2;
      transformPoint.y = bounds.y + bounds.height;
    } else if (
      Utils.bitwiseEquals(handle, AdornerType.BottomRight) ||
      Utils.bitwiseEquals(handle, AdornerType.RotateBottomRight)
    ) {
      transformPoint.x = bounds.x + bounds.width;
      transformPoint.y = bounds.y + bounds.height;
    } else if (
      Utils.bitwiseEquals(handle, AdornerType.LeftCenter) ||
      Utils.bitwiseEquals(handle, AdornerType.RotateLeftCenter)
    ) {
      transformPoint.x = bounds.x;
      transformPoint.y = bounds.y + bounds.height / 2;
    } else if (
      Utils.bitwiseEquals(handle, AdornerType.RightCenter) ||
      Utils.bitwiseEquals(handle, AdornerType.RotateRightCenter)
    ) {
      transformPoint.x = bounds.x + bounds.width;
      transformPoint.y = bounds.y + bounds.height / 2;
    }

    return transformPoint;
  }
}
