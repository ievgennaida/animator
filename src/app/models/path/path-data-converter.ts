import { PathDataCommand } from "./path-data-command";
import { PathType } from "./path-type";

const quadraticToCubicConst = 2.0 / 3.0;

export class PathDataConverter {
  static toCubicBezierAbs(command: PathDataCommand): PathDataCommand[] {
    if (PathDataCommand.isType(command.type, PathType.smoothCubicBezierAbs)) {
      const cloned = command.cloneCommand();
      cloned.values = [
        command.a?.x || command.prevPoint?.x || 0,
        command.a?.y || command.prevPoint?.x || 0,
        command.b?.x || command.p.x,
        command.b?.y || command.p.x,
        command.p.x,
        command.p.y,
      ];
      cloned.type = PathType.cubicBezierAbs;
      cloned.saveAsRelative = command.saveAsRelative;
      return [cloned];
    } else if (
      PathDataCommand.isType(command.type, PathType.quadraticBezierAbs) ||
      PathDataCommand.isType(command.type, PathType.smoothQuadraticBezierAbs)
    ) {
      const cloned = command.cloneCommand();
      const prevX = command.prevPoint?.x || 0;
      const prevY = command.prevPoint?.y || 0;
      const controlX =
        command.a?.x || (command.p.x || 0) - (command.prevPoint?.x || 0);
      const controlY =
        command.a?.y || (command.p.y || 0) - (command.prevPoint?.y || 0);
      cloned.values = [
        prevX + quadraticToCubicConst * (controlX - prevX),
        prevY + quadraticToCubicConst * (controlY - prevY),
        command.p.x + quadraticToCubicConst * (controlX - command.p.x),
        command.p.y + quadraticToCubicConst * (controlY - command.p.y),
        command.p.x,
        command.p.y,
      ];
      cloned.type = PathType.cubicBezierAbs;
      cloned.saveAsRelative = command.saveAsRelative;
      return [cloned];
    } else if (PathDataCommand.isType(command.type, PathType.arcAbs)) {
      const curves = command.arcApproxCurves();
      if (curves) {
        const convertedCommands = curves.map((p) => {
          const converted = new PathDataCommand(PathType.cubicBezierAbs, [
            // a.x
            p[0],
            // a.y
            p[1],
            // b.x
            p[2],
            // b.y
            p[3],
            // x
            p[4],
            // y
            p[5],
          ]);
          converted.type = PathType.cubicBezierAbs;
          converted.saveAsRelative = command.saveAsRelative;
          return converted;
        });
        return convertedCommands;
      }
    } else if (
      PathDataCommand.isType(command.type, PathType.lineAbs) ||
      PathDataCommand.isType(command.type, PathType.horizontalAbs) ||
      PathDataCommand.isType(command.type, PathType.verticalAbs)
    ) {
      const cloned = command.cloneCommand();
      cloned.type = PathType.cubicBezierAbs;
      cloned.values = [
        command?.prevPoint?.x || 0,
        command?.prevPoint?.y || 0,
        command?.p?.x || 0,
        command?.p?.y || 0,
        command.p.x,
        command.p.y,
      ];

      return [cloned];
    }

    return [];
  }
  static toQuadraticBezier(command: PathDataCommand): PathDataCommand[] {
    if (
      PathDataCommand.isType(command.type, PathType.smoothQuadraticBezierAbs)
    ) {
      const cloned = command.cloneCommand();
      cloned.type = PathType.quadraticBezierAbs;
      cloned.values = [
        command.a?.x || 0,
        command.a?.y || 0,
        command.p.x,
        command.p.y,
      ];
      return [cloned];
    }
    return [];
  }

  static toLine(command: PathDataCommand): PathDataCommand[] {
    const cloned = command.cloneCommand();
    cloned.type = PathType.lineAbs;
    if (PathDataCommand.isType(command.type, PathType.horizontalAbs)) {
      cloned.values[1] = command.y;
    } else if (PathDataCommand.isType(command.type, PathType.verticalAbs)) {
      const y = command.y;
      cloned.values[0] = command.x;
      cloned.values[1] = y;
    } else {
      // Convert any type to line
      cloned.values = [command.p.x, command.p.y];
    }
    return [cloned];
  }
  public static convertCommand(
    command: PathDataCommand,
    destinationType: PathType | string
  ): PathDataCommand[] {
    const isAbsolute = PathDataCommand.isAbsolutePathCommand(destinationType);
    if (PathDataCommand.isType(command.type, destinationType)) {
      const toReturn = command.cloneCommand();
      // Already the same
      toReturn.saveAsRelative = !isAbsolute;
      toReturn.type = destinationType;
      return [toReturn];
    }

    let converted: PathDataCommand[] | null = [];
    if (PathDataCommand.isType(destinationType, PathType.lineAbs)) {
      converted = PathDataConverter.toLine(command);
    } else if (PathDataCommand.isType(destinationType, PathType.moveAbs)) {
      const toReturn = command.cloneCommand();

      toReturn.values = [command.p.x, command.p.y];
      // Already the same
      toReturn.saveAsRelative = !isAbsolute;
      toReturn.type = destinationType;
      converted.push(toReturn);
    } else if (
      PathDataCommand.isType(destinationType, PathType.quadraticBezierAbs)
    ) {
      converted = PathDataConverter.toQuadraticBezier(command);
    } else if (
      PathDataCommand.isType(destinationType, PathType.cubicBezierAbs)
    ) {
      converted = PathDataConverter.toCubicBezierAbs(command);
    } else if (PathDataCommand.isType(destinationType, PathType.closeAbs)) {
      const toReturn = command.cloneCommand();
      toReturn.values = [];
      // Already the same
      toReturn.saveAsRelative = !isAbsolute;
      toReturn.type = destinationType;
      converted.push(toReturn);
    }

    if (!converted) {
      return [];
    }
    converted.forEach((line) => {
      line.saveAsRelative = !isAbsolute;
      line.type = destinationType;
    });
    return converted;
  }
}
