/**
 * Adorner container type.
 */
export enum AdornerType {
  /**
   * Relative bounds, all applied transformations are displayed.
   */
  TransformedElement,
  /**
   * Untransformed bounds of the element. Element transformation are ignored.
   */
  ElementsBounds,
  /**
   * Selection Rectangle.
   */
  Selection,
  /**
   * Selected path data points.
   */
  PathDataSelection,
}

/**
 * Adorner point
 */
export enum AdornerPointType {
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
  static isRotateAdornerType(data: AdornerPointType): boolean {
    return (
      data > AdornerPointType.Center &&
      data <= AdornerPointType.RotateRightCenter
    );
  }
  static isScaleAdornerType(data: AdornerPointType): boolean {
    return data > AdornerPointType.None && data <= AdornerPointType.RightCenter;
  }
  static toScaleAdornerType(key: AdornerPointType): AdornerPointType {
    if (key <= AdornerPointType.Center) {
      return key;
    } else {
      return key - AdornerPointType.Center;
    }
  }

  static toRotateAdornerType(key: AdornerPointType): AdornerPointType {
    if (key > AdornerPointType.Center) {
      return key;
    } else {
      return key + AdornerPointType.Center;
    }
  }

  static allowToRotateAdorners(key: AdornerPointType): boolean {
    return (
      key !== AdornerPointType.Center &&
      key !== AdornerPointType.CenterTransform
    );
  }

  /**
   * Get opposite adorner side if any.
   */
  static getOpposite(handle: AdornerPointType): AdornerPointType {
    if (handle === AdornerPointType.RotateTopLeft) {
      return AdornerPointType.RotateBottomRight;
    } else if (handle === AdornerPointType.RotateTopCenter) {
      return AdornerPointType.RotateBottomCenter;
    } else if (handle === AdornerPointType.RotateTopRight) {
      return AdornerPointType.RotateBottomLeft;
    } else if (handle === AdornerPointType.RotateBottomLeft) {
      return AdornerPointType.RotateTopRight;
    } else if (handle === AdornerPointType.RotateBottomCenter) {
      return AdornerPointType.RotateTopCenter;
    } else if (handle === AdornerPointType.RotateBottomRight) {
      return AdornerPointType.RotateTopLeft;
    } else if (handle === AdornerPointType.RotateLeftCenter) {
      return AdornerPointType.RotateRightCenter;
    } else if (handle === AdornerPointType.RotateRightCenter) {
      return AdornerPointType.RotateLeftCenter;
    }

    if (handle === AdornerPointType.TopLeft) {
      return AdornerPointType.BottomRight;
    } else if (handle === AdornerPointType.TopCenter) {
      return AdornerPointType.BottomCenter;
    } else if (handle === AdornerPointType.TopRight) {
      return AdornerPointType.BottomLeft;
    } else if (handle === AdornerPointType.BottomLeft) {
      return AdornerPointType.TopRight;
    } else if (handle === AdornerPointType.BottomCenter) {
      return AdornerPointType.TopCenter;
    } else if (handle === AdornerPointType.BottomRight) {
      return AdornerPointType.TopLeft;
    } else if (handle === AdornerPointType.LeftCenter) {
      return AdornerPointType.RightCenter;
    } else if (handle === AdornerPointType.RightCenter) {
      return AdornerPointType.LeftCenter;
    }

    return handle;
  }
  /**
   * Get DOM react point by the adorner position.
   * @param bounds rect bounds.
   * @param handle adorner type.
   */
  static getAdornerPosition(
    bounds: DOMRect,
    handle: AdornerPointType
  ): DOMPoint {
    const transformPoint = new DOMPoint(bounds.x, bounds.y);

    if (
      handle === AdornerPointType.TopLeft ||
      handle === AdornerPointType.RotateTopLeft
    ) {
      return transformPoint;
    } else if (
      handle === AdornerPointType.TopCenter ||
      handle === AdornerPointType.RotateTopCenter
    ) {
      transformPoint.x = bounds.x + bounds.width / 2;
    } else if (
      handle === AdornerPointType.TopRight ||
      handle === AdornerPointType.RotateTopRight
    ) {
      transformPoint.x = bounds.x + bounds.width;
    } else if (
      handle === AdornerPointType.BottomLeft ||
      handle === AdornerPointType.RotateBottomLeft
    ) {
      transformPoint.x = bounds.x;
      transformPoint.y = bounds.y + bounds.height;
    } else if (
      handle === AdornerPointType.BottomCenter ||
      handle === AdornerPointType.RotateBottomCenter
    ) {
      transformPoint.x = bounds.x + bounds.width / 2;
      transformPoint.y = bounds.y + bounds.height;
    } else if (
      handle === AdornerPointType.BottomRight ||
      handle === AdornerPointType.RotateBottomRight
    ) {
      transformPoint.x = bounds.x + bounds.width;
      transformPoint.y = bounds.y + bounds.height;
    } else if (
      handle === AdornerPointType.LeftCenter ||
      handle === AdornerPointType.RotateLeftCenter
    ) {
      transformPoint.x = bounds.x;
      transformPoint.y = bounds.y + bounds.height / 2;
    } else if (
      handle === AdornerPointType.RightCenter ||
      handle === AdornerPointType.RotateRightCenter
    ) {
      transformPoint.x = bounds.x + bounds.width;
      transformPoint.y = bounds.y + bounds.height / 2;
    }

    return transformPoint;
  }
}
