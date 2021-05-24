import { Utils } from "src/app/services/utils/utils";
import { consts } from "src/environments/consts";
import { PathDataCommand } from "./path-data-command";
import { PathDataConverter } from "./path-data-converter";
import { PathType } from "./path-type";
export class PathData {
  constructor(public commands: PathDataCommand[] = []) {}
  public static setPathData(
    data: PathData,
    element: any | SVGGraphicsElement
  ): boolean {
    const set = false;
    if (element.setPathData && data) {
      const converted = data.clone();
      // Try to preserve original data
      data.commands.forEach((command, index) => {
        // Round values:
        let clonedCommand = converted.commands[index];
        if (consts.pathDataAccuracy || consts.pathDataAccuracy === 0) {
          for (let i = 0; i < clonedCommand.values.length; i++) {
            const val = clonedCommand.values[i];
            if (typeof val === "number" && !Number.isNaN(val)) {
              clonedCommand.values[i] = Utils.round(
                val,
                consts.pathDataAccuracy
              );
            }
          }
        }
        // Save as relative if it was specified to be saved like this:
        if (clonedCommand.saveAsRelative && !clonedCommand.isRelative()) {
          clonedCommand = command.getRelative();
        }
        converted.commands[index] = clonedCommand;
      });
      element.setPathData(converted.commands);
      return set;
    }
    return set;
  }
  public static getPathData(
    element: any | SVGGraphicsElement
  ): PathData | null {
    if (element && element.getPathData) {
      return PathData.wrap(element.getPathData());
    }
    return null;
  }
  public static wrap(elements: Array<any>): PathData | null {
    if (!elements || !Array.isArray(elements)) {
      return null;
    }

    return PathData.analyze(elements) as PathData;
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
   *
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
  public normalize(normalizeTypes: string[] | null = null): PathData {
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
        data.convertCommand(command, PathType.lineAbs);
      }
    });

    return data;
  }
  /**
   * Remove all commands starting from current by type.
   */
  removeCommandsChainByType(
    command: PathDataCommand | null,
    includeSelf = false,
    directionLeft = false,
    type: PathType = PathType.moveAbs
  ) {
    if (!command) {
      return;
    }
    let toCheck: PathDataCommand | null = command;
    if (!includeSelf) {
      toCheck = (directionLeft ? command?.prev : command?.next) || null;
    }
    // Remove prev commands if necessary.
    while (toCheck && toCheck.isType(type)) {
      const nextToCheck: PathDataCommand | null = directionLeft
        ? toCheck?.prev
        : toCheck?.next;
      this.deleteCommand(toCheck);
      toCheck = nextToCheck;
    }
  }
  public convertCommand(
    command: PathDataCommand,
    destinationType: PathType
  ): PathDataCommand[] {
    const convertedItems = PathDataConverter.convertCommand(
      command,
      destinationType
    );
    this.replaceCommand(command, ...convertedItems);
    return convertedItems;
  }
  isSegmentEnd(command: PathDataCommand | null): boolean {
    return (
      !command ||
      !command?.pathData ||
      command.isType(PathType.closeAbs) ||
      //
      command.index === command?.pathData?.commands?.length - 1
    );
  }

  getSegment(command: PathDataCommand): PathDataCommand[] {
    const commands: PathDataCommand[] = [];
    if (!command) {
      return commands;
    }
    commands.push(command);
    if (!command.isType(PathType.moveAbs)) {
      let nextPrev = command.prev;
      while (nextPrev) {
        commands.push(nextPrev);
        if (
          nextPrev.isType(PathType.closeAbs) ||
          nextPrev.isType(PathType.moveAbs)
        ) {
          break;
        }
        nextPrev = nextPrev.prev;
      }
    }
    commands.reverse();
    let toCheck = command.next;
    if (command && !command.isType(PathType.closeAbs)) {
      while (toCheck && !toCheck.isType(PathType.moveAbs)) {
        commands.push(toCheck);
        if (toCheck.isType(PathType.closeAbs)) {
          break;
        }
        toCheck = toCheck.next;
      }
    }
    return commands;
  }
  /**
   * Remove command and keep structure of path data.
   * Use deleteCommand to delete the exact command.
   */
  removeCommand(command: PathDataCommand): boolean {
    if (!command) {
      return false;
    }

    const segmentCommands = this.getSegment(command);
    const commands = segmentCommands.filter(
      (p) => p !== command && !p.isType(PathType.moveAbs, PathType.closeAbs)
    );
    const count = command.isType(PathType.moveAbs)
      ? commands.length - 1
      : commands.length;
    const removeSegment = count === 0;
    if (removeSegment) {
      // Remove full segment, no sense to keep it while only closed nodes exists.
      for (let i = segmentCommands.length - 1; i >= 0; i--) {
        const toRemove = segmentCommands[i] || null;
        this.deleteCommand(toRemove);
      }
      return true;
    }

    const pathData = command.pathData;
    const nextCommand = command.next;
    if (command.isType(PathType.moveAbs) && nextCommand) {
      // In this case replace make no sense:
      const nextNodeClose = this.isSegmentEnd(nextCommand);
      if (!nextNodeClose) {
        // Replace command:
        this.convertCommand(nextCommand, PathType.moveAbs);
      }
      this.deleteCommand(command);
    } else {
      this.deleteCommand(command);
    }
    return true;
  }

  public replaceCommand(
    command: PathDataCommand,
    ...commands: PathDataCommand[]
  ): boolean {
    const index = this.commands.indexOf(command);
    if (index >= 0 && Utils.deleteElement(this.commands, command)) {
      this.insertCommands(index, commands);
      return true;
    } else {
      console.log("Command to be replaced cannot be found");
    }
    return false;
  }
  insertCommands(index: number, commandsToAdd: PathDataCommand[]): void {
    commandsToAdd.forEach((command) => {
      command.pathData = this;
    });
    Utils.insertElements(this.commands, commandsToAdd, index);
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

  moveCommands(
    toIndex: number,
    commandIndex: number,
    elementsToMove: number = 1
  ) {
    const elementsToTake: PathDataCommand[] = this.commands.slice(
      commandIndex,
      commandIndex + elementsToMove
    );
    // Delete
    this.commands.splice(commandIndex, elementsToTake.length);
    // Insert
    this.commands.splice(toIndex, 0, ...elementsToTake);
  }
  deleteCommand(command: PathDataCommand | null): boolean {
    if (!command) {
      return false;
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
