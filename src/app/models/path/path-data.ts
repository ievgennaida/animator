import { Utils } from "src/app/services/utils/utils";
import { consts } from "src/environments/consts";
import { PathDataCommand } from "./path-data-command";
import { PathType } from "./path-type";
export class PathData {
  constructor(public commands: PathDataCommand[] = []) {}
  public static setPathData(
    data: PathData,
    element: any | SVGGraphicsElement
  ): boolean {
    const set = false;
    if (element.setPathData && data && data.commands) {
      const converted = new PathData();
      // Try to preserve original data
      data.commands.forEach((command) => {
        // Round values:
        if (consts.pathDataAccuracy || consts.pathDataAccuracy === 0) {
          for (let i = 0; i < command.values.length; i++) {
            const val = command.values[i];
            if (typeof val === "number" && !Number.isNaN(val)) {
              command.values[i] = Utils.round(val, consts.pathDataAccuracy);
            }
          }
        }
        // Save as relative if it was specified to be saved like this:
        if (command.saveAsRelative && !command.isRelative()) {
          command = command.getRelative(converted);
        }
        converted.commands.push(command);
      });
      element.setPathData(converted.commands);
      return set;
    }
    return set;
  }
  public static getPathData(element: any | SVGGraphicsElement): PathData {
    if (element && element.getPathData) {
      return PathData.wrap(element.getPathData());
    }
    return null;
  }
  public static wrap(elements: Array<any>): PathData {
    if (!elements || !Array.isArray(elements)) {
      return null;
    }

    return PathData.analyze(elements) as PathData;
  }

  public static convertCommand(
    command: PathDataCommand,
    destinationType: string
  ) {
    if (
      command.type === PathType.horizontal ||
      command.type === PathType.horizontalAbs
    ) {
      command.values[1] = command.y;
    } else if (
      command.type === PathType.vertical ||
      command.type === PathType.verticalAbs
    ) {
      const y = command.y;
      command.values[0] = command.x;
      command.values[1] = y;
    }
    command.type = destinationType;
  }

  public static isSameCommandType(typeA: string, typeB: string): boolean {
    if (
      typeA &&
      typeB &&
      typeA === typeB &&
      typeA.toUpperCase() === typeB.toUpperCase()
    ) {
      return true;
    }
    return false;
  }
  /**
   * Get path data and calculate absolute version for each point.
   * @param pathData arguments.
   */
  public static analyze(elements: Array<any> | null): PathData | null {
    let curX = 0;
    let curY = 0;

    let subPath = new DOMPoint();
    const pathData = new PathData();
    if (!elements) {
      return pathData;
    }
    pathData.commands = elements
      .filter((p) => !!p && !!p.type)
      .map((p) => {
        const command = new PathDataCommand(p.type, p.values, pathData);
        // Application is working only with absolute values, but every time original value mode is calculated as well.
        // This is a way to preserve the original state!
        const type = p.type as PathType;
        const isMove = type === PathType.move || type === PathType.moveAbs;
        if (type === PathType.arc || type === PathType.arcAbs) {
          const absolute = type === PathType.arcAbs;
          let x = command.x;
          let y = command.y;
          if (!absolute) {
            x += curX;
            y += curY;
            const absoluteValues = [
              command.values[0],
              command.values[1],
              command.values[2],
              command.values[3],
              command.values[4],
              x,
              y,
            ];
            command.values = absoluteValues;
            command.type = PathType.arcAbs;
          }

          curX = x;
          curY = y;
        } else if (type === PathType.horizontalAbs) {
          curX = command.x;
        } else if (type === PathType.verticalAbs) {
          curY = command.y;
        } else if (type === PathType.horizontal) {
          const x = curX + command.x;
          // Convert to absolute
          command.values = [x];
          curX = x;
        } else if (type === PathType.vertical) {
          const y = curY + command.y;
          // Convert to absolute
          command.values = [y];
          curY = y;
        } else if (type === PathType.close || type === PathType.closeAbs) {
          curY = subPath.y;
          curX = subPath.x;
        } else {
          const absolute = command.isAbsolute();
          if (!absolute) {
            const absoluteValues = command.values.map((commandValues, index) =>
              !(index % 2) ? curX + commandValues : curY + commandValues
            );
            command.values = absoluteValues;
          }
          const point = command.p;
          curX = point.x;
          curY = point.y;
          if (isMove) {
            subPath = point;
          }
        }

        command.type = p.type.toUpperCase();
        return command;
      });

    return pathData;
  }
  public toString(): string {
    let d = "";

    for (let i = 0; i < this.commands.length; i += 1) {
      const seg = this.commands[i];
      d += (i > 0 ? " " : "") + seg.toString();
    }
    return d;
  }
  public normalize(normalizeTypes: string[] = null): PathData {
    const data = this;
    if (!data) {
      return data;
    }
    data.forEach((command) => {
      if (normalizeTypes && !normalizeTypes.includes(command.type)) {
        return;
      }
      if (
        command.type === PathType.horizontalAbs ||
        command.type === PathType.verticalAbs
      ) {
        PathData.convertCommand(command, PathType.lineAbs);
      }
    });

    return data;
  }

  public clone(): PathData {
    const cloned = new PathData();
    this.forEach((command) => {
      const clonedCommand = command.cloneCommand();
      clonedCommand.pathData = cloned;
      cloned.commands.push(clonedCommand);
    });
    return cloned;
  }

  deleteCommand(command: PathDataCommand | null): boolean {
    if (!command) {
      return null;
    }
    const isRemoved = Utils.deleteElement(this.commands, command);
    return isRemoved;
  }

  deleteCommandByIndex(index: number): boolean {
    const command = this.commands[index];
    return this.deleteCommand(command);
  }

  /**
   * Iterate all absolute commands.
   */
  forEach(iterator: (command: PathDataCommand, index: number) => void) {
    if (!iterator || !this.commands) {
      return;
    }
    this.commands.forEach((command, index) => {
      if (command) {
        const abs = command;
        if (abs) {
          iterator(command, index);
        }
      }
    });
  }
}
