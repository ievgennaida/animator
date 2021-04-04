import { DecomposedMatrix } from "src/app/models/decompose-matrix";
import { PathDataHandle } from "src/app/models/path-data-handle";
import { PathDataHandleType } from "src/app/models/path-data-handle-type";
import { PathData } from "src/app/models/path/path-data";
import { PathDataCommand } from "src/app/models/path/path-data-command";
import { PathType } from "src/app/models/path/path-type";
import { PointOnPathUtils } from "./path-utils/point-on-path";
import { Utils } from "./utils";

export class PathDataUtils {
  /**
   * transform path data by a matrix.
   *
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
            PathDataUtils.allowToManipulatePoint(command, filters);
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
          if (allowedChangeControlPointA && a) {
            command.a = a.matrixTransform(matrix);
            changed = true;
          }
          const b = command.b;
          const allowedChangeControlPointB =
            b &&
            !command.changedB &&
            (manipulateP ||
              PathDataUtils.isAllowMoveHandleB(commandIndex, command, filters));

          if (allowedChangeControlPointB && b) {
            command.b = b.matrixTransform(matrix);
            changed = true;
          }

          if (manipulateP && command.type === PathType.arcAbs) {
            const center = command.center;
            if (center) {
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
    command: PathDataCommand,
    filters: PathDataHandle[] | null
  ): boolean {
    if (!command || command.isType(PathType.closeAbs)) {
      return false;
    }

    // Allow to manipulate when no filters are specified.
    if (!filters || filters.length === 0) {
      return true;
    }

    const commandIndex = command.index;
    if (commandIndex === -1) {
      console.log(`Invalid state, command is detached:${command.type}`);
      return false;
    }

    const allowedToManipulatePoint = !!filters.find((f) => {
      // Move exact point:
      if (f.type === PathDataHandleType.point) {
        if (f.commandIndex === commandIndex) {
          return true;
        } else if (
          // Allow to manipulate next point for the lines.
          f.commandIndex - 1 === commandIndex &&
          (f.command.isType(PathType.lineAbs) ||
            f.command.isType(PathType.arcAbs) ||
            f.command.isType(PathType.verticalAbs) ||
            f.command.isType(PathType.horizontalAbs)) &&
          (command.type === PathType.lineAbs ||
            command.type === PathType.arcAbs ||
            command.type === PathType.verticalAbs ||
            command.type === PathType.horizontalAbs)
        ) {
          return true;
        }
      } else if (f.type === PathDataHandleType.curve) {
        // check whether we can move current command by Z:
        if (
          command.isType(PathType.moveAbs) &&
          f.command.isType(PathType.closeAbs)
        ) {
          const moveCommand = PointOnPathUtils.getPrevByType(
            f.command,
            true,
            PathType.moveAbs
          );
          if (moveCommand?.index === command.index) {
            return true;
          }
        } else if (f.commandIndex === commandIndex) {
          return true;
        } else if (
          // Allow to manipulate next point for the lines.
          f.commandIndex - 1 === commandIndex &&
          (f.command.type === PathType.closeAbs ||
            f.command.type === PathType.lineAbs ||
            f.command.type === PathType.arcAbs ||
            f.command.type === PathType.verticalAbs ||
            f.command.type === PathType.horizontalAbs)
        ) {
          return true;
        }
      }

      return false;
    });

    return allowedToManipulatePoint;
  }
  static isAllowMoveHandleA(
    commandIndex: number,
    command: PathDataCommand,
    filters: PathDataHandle[] | null = null
  ): boolean {
    // Allow to manipulate when no filters are specified.
    if (!filters || filters.length === 0) {
      return true;
    }

    // Manipulate prev point with a handle.
    return !!filters.find((f) => {
      if (f.type === PathDataHandleType.handleA) {
        return f.commandIndex === commandIndex;
      } else if (f.type === PathDataHandleType.point) {
        if (f.commandIndex === commandIndex) {
          if (f.command.isType(PathType.quadraticBezierAbs)) {
            return true;
          }
        }
      } else if (f.type === PathDataHandleType.curve) {
        return f.commandIndex === commandIndex;
      }
      return false;
    });
  }
  static isAllowMoveHandleB(
    commandIndex: number,
    command: PathDataCommand,
    filters: PathDataHandle[] | null = null
  ): boolean {
    // Allow to manipulate when no filters are specified.
    if (!filters || filters.length === 0) {
      return true;
    }

    return !!filters.find((f) => {
      if (f.type === PathDataHandleType.handleB) {
        return f.commandIndex === commandIndex;
      } else if (f.type === PathDataHandleType.curve) {
        return f.commandIndex === commandIndex;
      } else if (f.type === PathDataHandleType.point) {
        return f.commandIndex === commandIndex;
      }
      return false;
    });
  }
}
