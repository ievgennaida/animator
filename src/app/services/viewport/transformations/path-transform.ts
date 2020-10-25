import { HandleData } from "src/app/models/handle-data";
import {
  PathDataHandle,
  PathDataHandleType,
} from "src/app/models/path-data-handle";
import { PathData } from "src/app/models/path/path-data";
import { PathDataCommand } from "src/app/models/path/path-data-command";
import { PathType } from "src/app/models/path/path-type";
import { Utils } from "../../utils/utils";
import { MatrixTransform, TransformationMode } from "./matrix-transform";

export class PathTransform extends MatrixTransform {
  prevAngle = 0;
  transformOrigin: DOMPoint = null;
  initPathData: PathData = null;
  /**
   * List of a particular path handles to be transformed.
   */
  public pathHandles: PathDataHandle[] | null = null;

  moveByMouse(screenPos: DOMPoint): boolean {
    const element = this.getElement();
    const elementPoint = Utils.toElementPoint(element, screenPos);
    if (!elementPoint) {
      return;
    }

    const isChanged = this.translate(elementPoint.x, elementPoint.y);
    this.start = elementPoint;
    return isChanged;
  }
  beginHandleTransformation(screenPos: DOMPoint, handle: HandleData) {
    super.beginHandleTransformation(screenPos, handle);
    this.initPathData = this.node.getPathData(false);
  }
  beginMouseRotateTransaction(pos: DOMPoint) {
    const element = this.getElement();
    this.mode = TransformationMode.Rotate;
    this.transformOrigin = this.getTransformOrigin();
    const transformOrigin = this.transformOrigin;
    const transformedCenter = Utils.toScreenPoint(element, transformOrigin);
    this.startOffset = -Utils.angle(transformedCenter, pos);
  }

  rotateByMouse(currentViewPoint: DOMPoint): boolean {
    const transformPoint = this.transformOrigin;
    const element = this.getElement();
    const screenTransformOrigin = Utils.toScreenPoint(element, transformPoint);
    let angle = -Utils.angle(screenTransformOrigin, currentViewPoint);

    angle -= this.startOffset;
    const angleBefore = angle;
    angle -= this.prevAngle;
    const changed = this.rotateOffset(angle, transformPoint);
    this.prevAngle = angleBefore;
    return changed;
  }

  scaleOffset(
    offsetX: number,
    offsetY: number,
    transformPoint: DOMPoint
  ): boolean {
    offsetY = this.normalizeScale(offsetY);
    offsetX = this.normalizeScale(offsetX);
    const matrix = this.generateScaleMatrix(offsetX, offsetY, transformPoint);
    const changed = this.transformInitialPathByMatrix(matrix);
    return changed;
  }

  scaleByScreenMatrix(screenScaleMatrix: DOMMatrix): boolean {
    const element = this.getElement();
    const parent = element.parentNode as SVGGraphicsElement;
    // Get original to screen matrix from which transformation was started:
    const parentCTM = parent.getScreenCTM();
    const toScreenMatrix = parentCTM.multiply(this.initTransformMatrix);

    const newTransformationMatrix = this.convertScreenMatrixToElementMatrix(
      screenScaleMatrix,
      toScreenMatrix,
      element.ownerSVGElement.createSVGMatrix()
    );

    // Apply new created transform back to the element:
    return this.transformInitialPathByMatrix(newTransformationMatrix);
  }

  /**
   * Apply matrix to originally stored path data.
   * @param matrix to be applied.
   */
  transformInitialPathByMatrix(matrix: DOMMatrix): boolean {
    const pathData = this.initPathData.clone();
    // matrix = matrix.multiply(transform?.matrix);
    const changed = this.transformPathByMatrix(
      matrix,
      pathData,
      this.pathHandles
    );
    if (changed) {
      this.node.setPathData(pathData);
    }
    return changed;
  }
  /**
   * transform path data by a matrix.
   * @param matrix matrix to transform path data
   * @param pathData path data to transform.
   * @param filters filter the points to be be transformed.
   */
  transformPathByMatrix(
    matrix: DOMMatrix,
    pathData: PathData,
    filters: PathDataHandle[] | null = null
  ): boolean {
    let changed = false;
    if (pathData) {
      // Virtual control point can affect previous related commands.
      // We need to avoid double
      pathData.forEach((command) => command.markAsUnchanged());
      pathData.forEach((command, commandIndex) => {
        if (command) {
          const p = command.p;
          // Command point:
          const manipulateP =
            !command.changedP &&
            this.allowToManipulatePoint(commandIndex, command, filters);
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
            this.isAllowMoveHandleA(commandIndex, command, filters);
          if (allowedChangeControlPointA) {
            command.a = a.matrixTransform(matrix);
            changed = true;
          }
          const b = command.b;
          const allowedChangeControlPointB =
            b &&
            !command.changedB &&
            (manipulateP ||
              this.isAllowMoveHandleB(commandIndex, command, filters));

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
            const ryLen = Utils.getLength(ry, newCenter);
            const rxLen = Utils.getLength(rx, newCenter);
            command.rx = rxLen;
            command.ry = ryLen;
            if (command.rx !== rxLen || command.ry !== ryLen) {
              changed = true;
            }

            const rotatedMatrix = matrix.rotate(command.rotation);
            const decomposedRotation = this.decomposeMatrix(rotatedMatrix);
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

  allowToManipulatePoint(
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
  isAllowMoveHandleA(
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
  isAllowMoveHandleB(
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

  rotateOffset(angle: number, transformPoint: DOMPoint) {
    const element = this.getElement();

    const matrix = element.ownerSVGElement
      .createSVGMatrix()
      .translate(transformPoint.x, transformPoint.y)
      .rotate(angle, 0)
      .translate(-transformPoint.x, -transformPoint.y);
    const pathData = this.node.getPathData();
    pathData.normalize([
      PathType.horizontal,
      PathType.vertical,
      PathType.horizontalAbs,
      PathType.verticalAbs,
    ]);
    const changed = this.transformPathByMatrix(
      matrix,
      pathData,
      this.pathHandles
    );
    if (changed) {
      this.node.setPathData(pathData);
    }
    return changed;
  }
  translate(x: number, y: number): boolean {
    // Translate by offset
    const offsetX = x - this.start.x;
    const offsetY = y - this.start.y;
    if (!offsetX && !offsetY) {
      return false;
    }
    const element = this.getElement();
    const matrix = element.ownerSVGElement
      .createSVGMatrix()
      .translate(offsetX, offsetY);
    const pathData = this.node.getPathData();
    const changed = this.transformPathByMatrix(
      matrix,
      pathData,
      this.pathHandles
    );
    if (changed) {
      this.node.setPathData(pathData);
    }
    return changed;
  }
}
