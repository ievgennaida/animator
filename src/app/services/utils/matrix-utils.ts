import { DecomposedMatrix } from "src/app/models/decompose-matrix";
import { HandleData } from "src/app/models/handle-data";
import {
  PathDataHandle,
  PathDataHandleType,
} from "src/app/models/path-data-handle";
import { PathData } from "src/app/models/path/path-data";
import { PathDataCommand } from "src/app/models/path/path-data-command";
import { PathType } from "src/app/models/path/path-type";
import { TreeNode } from "src/app/models/tree-node";
import { Utils } from "./utils";

export class MatrixUtils {
  /**
   * Get element current transformation matrix.
   * @param element element to get matrix for.
   */
  public static getMatrix(
    element: SVGGraphicsElement | TreeNode
  ): DOMMatrix | null {
    if (!element) {
      return null;
    }
    return MatrixUtils.transformToElement(
      element,
      element.parentNode as SVGGraphicsElement | TreeNode
    );
  }
  public static transformToElement(
    fromElement: SVGGraphicsElement | TreeNode,
    toElement: SVGGraphicsElement | TreeNode
  ): DOMMatrix | null {
    if (!fromElement || !fromElement.getScreenCTM) {
      return null;
    }
    if (!toElement) {
      return fromElement.getScreenCTM();
    }

    const toMatrix = toElement.getScreenCTM();
    const fromMatrix = fromElement.getScreenCTM();
    if (!toMatrix || !fromMatrix) {
      return null;
    }
    return toMatrix.inverse().multiply(fromMatrix);
  }
  /**
   * Set matrix as transform attribute for the element.
   */
  public static setMatrix(element: SVGGraphicsElement, matrix: DOMMatrix) {
    const transform = element.ownerSVGElement.createSVGTransform();
    if (matrix) {
      transform.setMatrix(matrix);
    }
    element.transform.baseVal.initialize(transform);
    return true;
  }
  /**
   * Convert some screen matrix to element matrix coordinates.
   */
  static convertScreenMatrixToElementMatrix(
    screenScaleMatrix: DOMMatrix,
    elementToScreenMatrix: DOMMatrix,
    currentTransform: DOMMatrix
  ): DOMMatrix | null {
    const currentMatrix = currentTransform.multiply(
      elementToScreenMatrix
        .inverse()
        .multiply(screenScaleMatrix)
        .multiply(elementToScreenMatrix)
    );
    return currentMatrix;
  }

  static fitToBounds(
    elementNode: TreeNode,
    screenBounds: DOMRect,
    changePosition = true
  ): boolean {
    if (!screenBounds) {
      return false;
    }
    const element = elementNode.getElement();
    const bbox = element.getBoundingClientRect();
    // Get center of figure in element coordinates:
    const scaleX = screenBounds.width / bbox.width;
    const scaleY = screenBounds.height / bbox.height;
    const inputCenter = Utils.getRectCenter(bbox);
    let offsetX = 0;
    let offsetY = 0;
    if (changePosition) {
      const destCenter = Utils.getRectCenter(screenBounds);
      offsetX = destCenter.x - inputCenter.x;
      offsetY = destCenter.y - inputCenter.y;
    }

    // create scale matrix:
    const scaleMatrix = MatrixUtils.generateScaleMatrix(
      element,
      scaleX,
      scaleY,
      inputCenter
    );

    // get element self transformation matrix:
    const scaleAndTransform = element.ownerSVGElement
      .createSVGMatrix()
      .translate(offsetX, offsetY)
      .multiply(scaleMatrix);

    const toScreenMatrix = element.getScreenCTM();
    // Scale element by a matrix in screen coordinates and convert it back to the element coordinates:
    let currentMatrix = Utils.getElementTransform(element).matrix;
    currentMatrix = currentMatrix.multiply(
      toScreenMatrix
        .inverse()
        .multiply(scaleAndTransform)
        .multiply(toScreenMatrix)
    );

    // Apply new created transform back to the element:
    MatrixUtils.setMatrix(element, currentMatrix);
    return true;
  }
  /**
   * Generate scale matrix.
   */
  static generateScaleMatrix(
    element: SVGGraphicsElement,
    offsetX: number | null,
    offsetY: number | null,
    transformPoint: DOMPoint | null = null,
    matrix: DOMMatrix | null = null
  ): DOMMatrix | null {
    // Hack: fixed bug in chrome that scaling is applied only for one axis when regular scale method of matrix is called.
    const svgTransform = element.ownerSVGElement.createSVGTransform();
    svgTransform.setScale(offsetX, offsetY);

    let scalingMatrix = element.ownerSVGElement.createSVGMatrix();

    if (matrix) {
      scalingMatrix = scalingMatrix.multiply(matrix);
    }

    if (transformPoint) {
      scalingMatrix = scalingMatrix
        .translate(transformPoint.x, transformPoint.y)
        // multiply is used instead of the scale while proportional scale is applied for a scale (?)
        .multiply(svgTransform.matrix)
        .translate(-transformPoint.x, -transformPoint.y);
    } else {
      scalingMatrix = scalingMatrix.multiply(svgTransform.matrix);
    }
    return scalingMatrix;
  }

  /**
   * Transform rectangle by a matrix.
   * @param rect rectangle to transform.
   * @param matrix matrix to transform rectangle.
   * @param recalculateBounds Use when rectangle can be rotated.
   * In this case rotated bounds will be returned.
   */
  public static matrixRectTransform(
    rect: DOMRect,
    matrix: DOMMatrix,
    recalculateBounds = false
  ): DOMRect | null {
    if (!rect || !matrix) {
      return null;
    }
    const topLeft = new DOMPoint(rect.x, rect.y).matrixTransform(matrix);
    const bottomRight = new DOMPoint(
      rect.x + rect.width,
      rect.y + rect.height
    ).matrixTransform(matrix);
    if (recalculateBounds) {
      // We should recalculate bounds for a case when rect was rotated or skewed.
      const topRight = new DOMPoint(
        rect.x + rect.width,
        rect.y
      ).matrixTransform(matrix);
      const bottomLeft = new DOMPoint(
        rect.x,
        rect.y + rect.height
      ).matrixTransform(matrix);
      return Utils.getPointsBounds(topLeft, bottomRight, topRight, bottomLeft);
    } else {
      return new DOMRect(
        topLeft.x,
        topLeft.y,
        bottomRight.x - topLeft.x,
        bottomRight.y - topLeft.y
      );
    }
  }
  static normalizeScale(scale: number | null): number {
    scale = scale === null ? 1 : scale;
    if (!Number.isFinite(scale)) {
      scale = 1;
    }
    if (scale > Number.MAX_VALUE) {
      scale = Number.MAX_VALUE;
    }
    return scale;
  }
  /**
   * Convert transformation matrix to the X, Y coords as a preferable way to handle some of the svg elements: react, circle, ellipse etc.
   * @returns extracted coordinates in element coordinates.
   */
  static consolidateTranslate(element: SVGGraphicsElement): DOMPoint | null {
    const transformList = element.transform.baseVal;
    if (transformList.numberOfItems === 1) {
      const transform = transformList[0];
      if (transform.type === transform.SVG_TRANSFORM_TRANSLATE) {
        element.transform.baseVal.removeItem(0);
        const offsetX = transform.matrix.e;
        const offsetY = transform.matrix.f;
        element.removeAttribute("transform");
        return new DOMPoint(offsetX, offsetY);
      }
    } else if (transformList.numberOfItems > 1) {
      let consolidationRequired = true;
      for (let i = 0; i <= transformList.numberOfItems; i++) {
        const tr = transformList[i];
        if (
          tr &&
          (tr.type === tr.SVG_TRANSFORM_TRANSLATE ||
            tr.type === tr.SVG_TRANSFORM_MATRIX) &&
          tr.matrix.e &&
          tr.matrix.f
        ) {
          consolidationRequired = true;
          break;
        }
      }

      if (consolidationRequired) {
        const transform = transformList.consolidate();
        const offsetX = transform.matrix.e;
        const offsetY = transform.matrix.f;

        // Remove x and y from the matrix:
        const toSet = transform.matrix.translate(
          -transform.matrix.e,
          -transform.matrix.f
        );

        transform.setMatrix(toSet);
        element.transform.baseVal.initialize(transform);
        return new DOMPoint(offsetX, offsetY);
      }
    }

    return null;
  }
  static decomposeAnimatedTransformList(
    transforms: SVGAnimatedTransformList
  ): DecomposedMatrix {
    if (!transforms || !transforms.baseVal) {
      return null;
    }
    return MatrixUtils.decomposeTransformList(transforms.baseVal);
  }

  static decomposeTransformList(
    transforms: SVGTransformList
  ): DecomposedMatrix {
    if (!transforms) {
      return null;
    }
    const decomposed = new DecomposedMatrix();
    for (let i = 0; i < transforms.numberOfItems; i++) {
      const item = transforms.getItem(i);

      if (item.type === item.SVG_TRANSFORM_MATRIX) {
        decomposed.add(DecomposedMatrix.decomposeMatrix(item.matrix));
      } else if (item.type === item.SVG_TRANSFORM_ROTATE) {
        // For SVG_TRANSFORM_ROTATE, a, b, c, d, e and f
        // together represent the matrix which will result in the given rotation.
        // When the rotation is around the center point (0, 0), e and f will be zero.
        decomposed.rotateZ += item.angle;
      } else if (item.type === item.SVG_TRANSFORM_SCALE) {
        // For SVG_TRANSFORM_SCALE,
        // a and d represent the scale amounts (b=0, c=0, e=0 and f=0).
        decomposed.add(DecomposedMatrix.decomposeMatrix(item.matrix));
      } else if (item.type === item.SVG_TRANSFORM_SKEWX) {
        // For SVG_TRANSFORM_SKEWX and SVG_TRANSFORM_SKEWY,
        // a, b, c and d represent the matrix which will result in the given skew (e=0 and f=0).
        decomposed.add(DecomposedMatrix.decomposeMatrix(item.matrix));
      } else if (item.type === item.SVG_TRANSFORM_SKEWY) {
        decomposed.add(DecomposedMatrix.decomposeMatrix(item.matrix));
      } else if (item.type === item.SVG_TRANSFORM_TRANSLATE) {
        // For SVG_TRANSFORM_TRANSLATE, e and f represent the
        // translation amounts (a=1, b=0, c=0 and d=1).
        decomposed.translateX += item.matrix.e;
        decomposed.translateY += item.matrix.f;
      } else if (item.type === item.SVG_TRANSFORM_UNKNOWN) {
      }
    }

    return decomposed;
  }
}
export class PathDataUtils {
  /**
   * transform path data by a matrix.
   * @param matrix matrix to transform path data
   * @param pathData path data to transform.
   * @param filters filter the points list to be be transformed.
   */
  static transformPathByMatrix(
    pathData: PathData,
    matrix: DOMMatrix,
    filters: PathDataHandle[] | null = null
  ): boolean {
    let changed = false;
    if (pathData) {
      // Virtual control point can affect previous related commands points and handlers.
      // hack: We need to avoid double apply for the same handler.
      pathData.forEach((command) => command.markAsUnchanged());
      pathData.forEach((command, commandIndex) => {
        if (command) {
          const p = command.p;
          // Command point:
          const manipulateP =
            !command.changedP &&
            PathDataUtils.allowToManipulatePoint(
              commandIndex,
              command,
              filters
            );
          if (p && manipulateP) {
            changed = true;
            command.p = p.matrixTransform(matrix);
          }
          // Command handles:
          const a = command.a;
          const allowedChangeControlPointA =
            a &&
            // Check that it was not transformed in current cycle.
            !command.changedA &&
            PathDataUtils.isAllowMoveHandleA(commandIndex, command, filters);
          if (allowedChangeControlPointA) {
            command.a = a.matrixTransform(matrix);
            changed = true;
          }
          const b = command.b;
          const allowedChangeControlPointB =
            b &&
            !command.changedB &&
            (manipulateP ||
              PathDataUtils.isAllowMoveHandleB(commandIndex, command, filters));

          if (allowedChangeControlPointB) {
            command.b = b.matrixTransform(matrix);
            changed = true;
          }

          if (command.type === PathType.arcAbs) {
            const center = command.center;
            const rx = new DOMPoint(
              center.x + command.rx,
              center.y
            ).matrixTransform(
              matrix
                .translate(center.x, center.y)
                .rotate(command.rotation)
                .translate(-center.x, -center.y)
            );

            const ry = new DOMPoint(
              center.x,
              center.y + command.ry
            ).matrixTransform(
              matrix
                .translate(center.x, center.y)
                .rotate(command.rotation)
                .translate(-center.x, -center.y)
            );

            const newCenter = center.matrixTransform(matrix);
            const ryLen = Utils.getDistance(ry, newCenter);
            const rxLen = Utils.getDistance(rx, newCenter);
            command.rx = rxLen;
            command.ry = ryLen;
            if (command.rx !== rxLen || command.ry !== ryLen) {
              changed = true;
            }

            const rotatedMatrix = matrix.rotate(command.rotation);
            const decomposedRotation = DecomposedMatrix.decomposeMatrix(
              rotatedMatrix
            );
            if (decomposedRotation) {
              if (
                decomposedRotation.scaleX < 0 ||
                (decomposedRotation.scaleY < 0 &&
                  !(
                    decomposedRotation.scaleX < 0 &&
                    decomposedRotation.scaleY < 0
                  ))
              ) {
                command.sweep = !command.sweep;
                changed = true;
              }
              if (command.rotation !== decomposedRotation.rotateZ) {
                command.rotation = decomposedRotation.rotateZ;
                changed = true;
              }
            }
          }
        }
      });
    }

    return changed;
  }

  static allowToManipulatePoint(
    commandIndex: number,
    abs: PathDataCommand,
    filters: PathDataHandle[]
  ): boolean {
    // Allow to manipulate when no filters are specified.
    if (!filters) {
      return true;
    }

    const allowedToManipulatePoint = !!filters.find(
      (f) =>
        f.commandIndex === commandIndex &&
        (f.commandType === PathDataHandleType.Point ||
          ((abs.type === PathType.closeAbs ||
            abs.type === PathType.lineAbs ||
            abs.type === PathType.verticalAbs ||
            abs.type === PathType.horizontalAbs) &&
            f.commandType === PathDataHandleType.Curve))
    );

    return allowedToManipulatePoint;
  }
  static isAllowMoveHandleA(
    commandIndex: number,
    command: PathDataCommand,
    filters: PathDataHandle[]
  ): boolean {
    // Allow to manipulate when no filters are specified.
    if (!filters) {
      return true;
    }

    // Manipulate prev point with a handle.
    if (this.allowToManipulatePoint(commandIndex - 1, command, filters)) {
      return true;
    }
    return !!filters.find(
      (f) =>
        f.commandIndex === commandIndex &&
        (f.commandType === PathDataHandleType.HandleA ||
          f.commandType === PathDataHandleType.Curve)
    );
  }
  static isAllowMoveHandleB(
    commandIndex: number,
    command: PathDataCommand,
    filters: PathDataHandle[]
  ): boolean {
    // Allow to manipulate when no filters are specified.
    if (!filters) {
      return true;
    }

    return !!filters.find(
      (f) =>
        f.commandIndex === commandIndex &&
        (f.commandType === PathDataHandleType.HandleB ||
          f.commandType === PathDataHandleType.Curve)
    );
  }
}
