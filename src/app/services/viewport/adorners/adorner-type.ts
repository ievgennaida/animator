// tslint:disable: no-bitwise

export enum AdornerType {
  None,

  TopLeft,
  TopCenter,
  TopRight,
  BottomLeft,
  BottomCenter,
  BottomRight,
  LeftCenter,
  RightCenter,
  /**
   * Center of the transformation to be applied.
   */
  CenterTransform,
  /**
   * Center of the adorner.
   */
  Center,
  RotateTopLeft,
  RotateTopCenter,
  RotateTopRight,
  RotateBottomLeft,
  RotateBottomCenter,
  RotateBottomRight,
  RotateLeftCenter,
  RotateRightCenter,
}

export class AdornerTypeUtils {
  static isRotateAdornerType(data: AdornerType): boolean {
    return data > AdornerType.Center;
  }
  static toMoveAdornerType(key: AdornerType): AdornerType {
    if (key <= AdornerType.Center) {
      return key;
    } else {
      return key - AdornerType.Center;
    }
  }

  static toRotateAdornerType(key: AdornerType): AdornerType {
    if (key > AdornerType.Center) {
      return key;
    } else {
      return key + AdornerType.Center;
    }
  }
  /**
   * Get opposite adorner side if any.
   */
  static getOpposite(handle: AdornerType): AdornerType {
    if (handle === AdornerType.RotateTopLeft) {
      return AdornerType.RotateBottomRight;
    } else if (handle === AdornerType.RotateTopCenter) {
      return AdornerType.RotateBottomCenter;
    } else if (handle === AdornerType.RotateTopRight) {
      return AdornerType.RotateBottomLeft;
    } else if (handle === AdornerType.RotateBottomLeft) {
      return AdornerType.RotateTopRight;
    } else if (handle === AdornerType.RotateBottomCenter) {
      return AdornerType.RotateTopCenter;
    } else if (handle === AdornerType.RotateBottomRight) {
      return AdornerType.RotateTopLeft;
    } else if (handle === AdornerType.RotateLeftCenter) {
      return AdornerType.RotateRightCenter;
    } else if (handle === AdornerType.RotateRightCenter) {
      return AdornerType.RotateLeftCenter;
    }

    if (handle === AdornerType.TopLeft) {
      return AdornerType.BottomRight;
    } else if (handle === AdornerType.TopCenter) {
      return AdornerType.BottomCenter;
    } else if (handle === AdornerType.TopRight) {
      return AdornerType.BottomLeft;
    } else if (handle === AdornerType.BottomLeft) {
      return AdornerType.TopRight;
    } else if (handle === AdornerType.BottomCenter) {
      return AdornerType.TopCenter;
    } else if (handle === AdornerType.BottomRight) {
      return AdornerType.TopLeft;
    } else if (handle === AdornerType.LeftCenter) {
      return AdornerType.RightCenter;
    } else if (handle === AdornerType.RightCenter) {
      return AdornerType.LeftCenter;
    }

    return handle;
  }
  /**
   * Get DOM react point by the adorner position.
   * @param bounds rect bounds.
   * @param handle adorner type.
   */
  static getAdornerPosition(bounds: DOMRect, handle: AdornerType): DOMPoint {
    const transformPoint = new DOMPoint(bounds.x, bounds.y);

    if (
      handle === AdornerType.TopLeft ||
      handle === AdornerType.RotateTopLeft
    ) {
      return transformPoint;
    } else if (
      handle === AdornerType.TopCenter ||
      handle === AdornerType.RotateTopCenter
    ) {
      transformPoint.x = bounds.x + bounds.width / 2;
    } else if (
      handle === AdornerType.TopRight ||
      handle === AdornerType.RotateTopRight
    ) {
      transformPoint.x = bounds.x + bounds.width;
    } else if (
      handle === AdornerType.BottomLeft ||
      handle === AdornerType.RotateBottomLeft
    ) {
      transformPoint.x = bounds.x;
      transformPoint.y = bounds.y + bounds.height;
    } else if (
      handle === AdornerType.BottomCenter ||
      handle === AdornerType.RotateBottomCenter
    ) {
      transformPoint.x = bounds.x + bounds.width / 2;
      transformPoint.y = bounds.y + bounds.height;
    } else if (
      handle === AdornerType.BottomRight ||
      handle === AdornerType.RotateBottomRight
    ) {
      transformPoint.x = bounds.x + bounds.width;
      transformPoint.y = bounds.y + bounds.height;
    } else if (
      handle === AdornerType.LeftCenter ||
      handle === AdornerType.RotateLeftCenter
    ) {
      transformPoint.x = bounds.x;
      transformPoint.y = bounds.y + bounds.height / 2;
    } else if (
      handle === AdornerType.RightCenter ||
      handle === AdornerType.RotateRightCenter
    ) {
      transformPoint.x = bounds.x + bounds.width;
      transformPoint.y = bounds.y + bounds.height / 2;
    }

    return transformPoint;
  }
}
