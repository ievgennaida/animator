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
  beginMouseTransaction(mousePos: DOMPoint) {
    super.beginMouseTransaction(mousePos);
  }
  moveByMouse(screenPos: DOMPoint) {
    const element = this.getElement();
    const elementPoint = Utils.toElementPoint(element, screenPos);
    if (!elementPoint) {
      return;
    }

    this.translate(elementPoint);
    this.start = elementPoint;
  }
  beginHandleTransformation(handle: HandleData, screenPos: DOMPoint) {
    super.beginHandleTransformation(handle, screenPos);
    this.initPathData = this.node.getPathData(false);
  }
  beginMouseRotateTransaction(pos: DOMPoint) {
    const element = this.getElement();
    this.mode = TransformationMode.Rotate;
    this.transformOrigin = this.getTransformOrigin();
    const transformOrigin = this.transformOrigin;
    const transformedCenter = Utils.toScreenPoint(element, transformOrigin);
    this.startOffset = -Utils.angle(transformedCenter, pos);

    const matrix = this.transformToElement(
      element,
      element.parentNode as SVGGraphicsElement
    );

    const decomposed = this.decomposeMatrix(matrix);
    this.startOffset -= decomposed.rotateZ;
  }

  rotateByMouse(currentViewPoint: DOMPoint) {
    const transformPoint = this.transformOrigin;
    const element = this.getElement();
    const screenTransformOrigin = Utils.toScreenPoint(element, transformPoint);
    let angle = -Utils.angle(screenTransformOrigin, currentViewPoint);

    angle -= this.startOffset;
    const angleBefore = angle;
    angle -= this.prevAngle;
    this.rotateOffset(angle, transformPoint);
    this.prevAngle = angleBefore;
  }

  scaleOffset(offsetX: number, offsetY: number, transformPoint: DOMPoint) {
    offsetY = this.normalizeScale(offsetY);
    offsetX = this.normalizeScale(offsetX);
    const element = this.getElement();
    const svgTransform = element.ownerSVGElement.createSVGTransform();
    svgTransform.setScale(offsetX, offsetY);
    const matrix = element.ownerSVGElement
      .createSVGMatrix()
      .translate(transformPoint.x, transformPoint.y)
      .multiply(svgTransform.matrix)
      .translate(-transformPoint.x, -transformPoint.y);
    const pathData = this.initPathData.clone();
    const changed = this.transformPathByMatrix(
      matrix,
      pathData,
      this.pathHandles
    );
    if (changed) {
      this.node.setPathData(pathData);
      this.transformsService.emitTransformed(this.getElement());
    }
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
      pathData.forEach((command, commandIndex) => {
        if (command) {
          const p = command.p;
          // Command point:
          const manipulateP = this.allowToManipulatePoint(
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
            !command.isCalculatedA() &&
            this.isAllowMoveHandleA(commandIndex, command, filters);
          if (allowedChangeControlPointA) {
            command.a = a.matrixTransform(matrix);
            changed = true;
          }
          const b = command.b;
          const allowedChangeControlPointB =
            b &&
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
    abs: PathDataCommand,
    filters: PathDataHandle[]
  ): boolean {
    // Allow to manipulate when no filters are specified.
    if (!filters) {
      return true;
    }

    // Manipulate prev point with a handle.
    if (this.allowToManipulatePoint(commandIndex - 1, abs, filters)) {
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
    abs: PathDataCommand,
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
      this.transformsService.emitTransformed(this.getElement());
    }
  }
  translate(elementPoint: DOMPoint) {
    // Translate by offset
    const offsetX = elementPoint.x - this.start.x;
    const offsetY = elementPoint.y - this.start.y;
    if (!offsetX && !offsetY) {
      return;
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
      this.transformsService.emitTransformed(this.getElement());
    }
  }
}
