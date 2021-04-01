import { HandleData } from "src/app/models/handle-data";
import { AdornerPointType } from "./adorner-point-type";
import { TransformationMode } from "./transformation-mode";

export class AdornerTypeUtils {
    static isRotateAdornerType(data: AdornerPointType): boolean {
      return (
        data > AdornerPointType.center &&
        data <= AdornerPointType.rotateRightCenter
      );
    }
    static isScaleAdornerType(data: AdornerPointType): boolean {
      return data > AdornerPointType.none && data <= AdornerPointType.rightCenter;
    }
    static toScaleAdornerType(key: AdornerPointType): AdornerPointType {
      if (key <= AdornerPointType.center) {
        return key;
      } else {
        return key - AdornerPointType.center;
      }
    }
    /**
     * Get transformation mode by the adorner type.
     *
     * @param node tree node to transform.
     * @param handle clicked handler.
     */
    static getTransformationMode(handle: HandleData): TransformationMode {
      if (handle && handle.handle !== AdornerPointType.centerTransform) {
        if (AdornerTypeUtils.isRotateAdornerType(handle.handle)) {
          return TransformationMode.rotate;
        } else if (AdornerTypeUtils.isScaleAdornerType(handle.handle)) {
          return TransformationMode.scale;
        } else {
          return TransformationMode.translate;
        }
      } else {
        // Default is translate
        return TransformationMode.translate;
      }
    }
    static toRotateAdornerType(key: AdornerPointType): AdornerPointType {
      if (key > AdornerPointType.center) {
        return key;
      } else {
        return key + AdornerPointType.center;
      }
    }

    static allowToRotateAdorners(key: AdornerPointType): boolean {
      return (
        key !== AdornerPointType.center &&
        key !== AdornerPointType.centerTransform
      );
    }

    /**
     * Get opposite adorner side if any.
     */
    static getOpposite(handle: AdornerPointType): AdornerPointType {
      if (handle === AdornerPointType.rotateTopLeft) {
        return AdornerPointType.rotateBottomRight;
      } else if (handle === AdornerPointType.rotateTopCenter) {
        return AdornerPointType.rotateBottomCenter;
      } else if (handle === AdornerPointType.rotateTopRight) {
        return AdornerPointType.rotateBottomLeft;
      } else if (handle === AdornerPointType.rotateBottomLeft) {
        return AdornerPointType.rotateTopRight;
      } else if (handle === AdornerPointType.rotateBottomCenter) {
        return AdornerPointType.rotateTopCenter;
      } else if (handle === AdornerPointType.rotateBottomRight) {
        return AdornerPointType.rotateTopLeft;
      } else if (handle === AdornerPointType.rotateLeftCenter) {
        return AdornerPointType.rotateRightCenter;
      } else if (handle === AdornerPointType.rotateRightCenter) {
        return AdornerPointType.rotateLeftCenter;
      }

      if (handle === AdornerPointType.topLeft) {
        return AdornerPointType.bottomRight;
      } else if (handle === AdornerPointType.topCenter) {
        return AdornerPointType.bottomCenter;
      } else if (handle === AdornerPointType.topRight) {
        return AdornerPointType.bottomLeft;
      } else if (handle === AdornerPointType.bottomLeft) {
        return AdornerPointType.topRight;
      } else if (handle === AdornerPointType.bottomCenter) {
        return AdornerPointType.topCenter;
      } else if (handle === AdornerPointType.bottomRight) {
        return AdornerPointType.topLeft;
      } else if (handle === AdornerPointType.leftCenter) {
        return AdornerPointType.rightCenter;
      } else if (handle === AdornerPointType.rightCenter) {
        return AdornerPointType.leftCenter;
      }

      return handle;
    }
    /**
     * Get DOM react point by the adorner position.
     *
     * @param bounds rect bounds.
     * @param handle adorner type.
     */
    static getAdornerPosition(
      bounds: DOMRect,
      handle: AdornerPointType
    ): DOMPoint {
      const transformPoint = new DOMPoint(bounds.x, bounds.y);

      if (
        handle === AdornerPointType.topLeft ||
        handle === AdornerPointType.rotateTopLeft
      ) {
        return transformPoint;
      } else if (
        handle === AdornerPointType.topCenter ||
        handle === AdornerPointType.rotateTopCenter
      ) {
        transformPoint.x = bounds.x + bounds.width / 2;
      } else if (
        handle === AdornerPointType.topRight ||
        handle === AdornerPointType.rotateTopRight
      ) {
        transformPoint.x = bounds.x + bounds.width;
      } else if (
        handle === AdornerPointType.bottomLeft ||
        handle === AdornerPointType.rotateBottomLeft
      ) {
        transformPoint.x = bounds.x;
        transformPoint.y = bounds.y + bounds.height;
      } else if (
        handle === AdornerPointType.bottomCenter ||
        handle === AdornerPointType.rotateBottomCenter
      ) {
        transformPoint.x = bounds.x + bounds.width / 2;
        transformPoint.y = bounds.y + bounds.height;
      } else if (
        handle === AdornerPointType.bottomRight ||
        handle === AdornerPointType.rotateBottomRight
      ) {
        transformPoint.x = bounds.x + bounds.width;
        transformPoint.y = bounds.y + bounds.height;
      } else if (
        handle === AdornerPointType.leftCenter ||
        handle === AdornerPointType.rotateLeftCenter
      ) {
        transformPoint.x = bounds.x;
        transformPoint.y = bounds.y + bounds.height / 2;
      } else if (
        handle === AdornerPointType.rightCenter ||
        handle === AdornerPointType.rotateRightCenter
      ) {
        transformPoint.x = bounds.x + bounds.width;
        transformPoint.y = bounds.y + bounds.height / 2;
      }

      return transformPoint;
    }
  }
