import { Utils } from "../../services/utils/utils";
import { PathDataCommand } from "./path-data-command";
import { PathType } from "./path-type";

export class PathData {
  constructor(public commands: PathDataCommand[] = []) {}
  public static setPathData(
    data: PathData,
    element: any | SVGGraphicsElement
  ): void {
    if (element.setPathData) {
      element.setPathData(data.commands);
    }
  }
  public static getPathData(element: any | SVGGraphicsElement): PathData {
    if (element.getPathData) {
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

  public static wrapCommand(
    type: string,
    values: Array<number> = []
  ): PathDataCommand {
    if (!type) {
      return null;
    }
    return new PathDataCommand(type, values);
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

  /**
   * Get path data and set absolute version for each point.
   * @param pathData arguments.
   */
  public static analyze(pathData: PathData | Array<any>): PathData {
    if (!pathData) {
      return null;
    }

    let prev: PathDataCommand = null;
    const data =
      pathData instanceof PathData
        ? (pathData as PathData)
        : new PathData(
            pathData
              .filter((p) => !!p)
              .map((p) => {
                const command = PathData.wrapCommand(p.type, p.values);
                if (prev) {
                  prev.next = command;
                }
                command.prev = prev;
                prev = command;
                return command;
              })
          );

    if (!data || !data.commands) {
      if (!data.commands) {
        data.commands = [];
      }
      return data as PathData;
    }

    let curX = 0;
    let curY = 0;

    let subPath = new DOMPoint();
    prev = null;
    data.commands.forEach((seg) => {
      const type = seg.type;
      const isMove = type === "m" || type === "M";
      if (
        type === "M" ||
        type === "L" ||
        type === "T" ||
        type === "C" ||
        type === "Q" ||
        type === "S"
      ) {
        const p = seg.p;
        curX = p.x;
        curY = p.y;

        if (isMove) {
          subPath = p;
        }
      } else if (
        type === "m" ||
        type === "l" ||
        type === "t" ||
        type === "c" ||
        type === "q" ||
        type === "s"
      ) {
        const clonedArray = seg.values.map((p, index) =>
          !(index % 2) ? curX + p : curY + p
        );
        seg.absolute = PathData.wrapCommand(type.toUpperCase(), clonedArray);
        const point = seg.absolute.p;
        curX = point.x;
        curY = point.y;
        if (isMove) {
          subPath = point;
        }
      } else if (type === PathType.arc || type === PathType.arcAbs) {
        const absolute = type === PathType.arcAbs;
        let x = seg.x;
        let y = seg.y;
        if (!absolute) {
          x += curX;
          y += curY;
        }

        if (!absolute) {
          const cloned = [
            seg.values[0],
            seg.values[1],
            seg.values[2],
            seg.values[3],
            seg.values[4],
            x,
            y,
          ];
          seg.absolute = PathData.wrapCommand(PathType.arcAbs, cloned);
          seg.absolute.prev = seg.prev;
          seg.absolute.next = seg.next;
        }

        curX = x;
        curY = y;
      } else if (type === PathType.horizontalAbs) {
        curX = seg.x;
      } else if (type === PathType.verticalAbs) {
        curY = seg.y;
      } else if (type === PathType.horizontal) {
        const x = curX + seg.x;
        seg.absolute = PathData.wrapCommand(type.toUpperCase(), [x]);
        curX = x;
      } else if (type === PathType.vertical) {
        const y = curY + seg.y;
        seg.absolute = PathData.wrapCommand(type.toUpperCase(), [y]);
        curY = y;
      } else if (type === PathType.close || type === PathType.closeAbs) {
        curY = subPath.y;
        curX = subPath.x;
      }

      prev = seg;
    });

    return data;
  }
  public normalize(normalizeTypes: string[] = null): PathData {
    const data = this;
    if (!data || !data.commands) {
      return data;
    }
    data.commands.forEach((command) => {
      if (normalizeTypes && !normalizeTypes.includes(command.type)) {
        return;
      }
      if (
        command.type === PathType.horizontal ||
        command.type === PathType.vertical
      ) {
        PathData.convertCommand(command, PathType.line);
      } else if (
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
    if (this.commands) {
      this.commands.forEach((command, index) => {
        const clonedCommand = command.clone();
        if (index > 0) {
          const prev = cloned.commands[index - 1];
          clonedCommand.prev = prev;
          prev.next = clonedCommand;

          if (command.absolute) {
            if (prev) {
              if (prev.absolute) {
                command.absolute.prev = prev.absolute;
                prev.absolute.next = command.absolute;
              }
            }
          }
        }
        cloned.commands.push(clonedCommand);
      });
    }
    return cloned;
  }
  /**
   * recalculate self.
   */
  recalculate(): PathData {
    return PathData.analyze(this);
  }
}
