import { Utils } from "../../services/utils/utils";
import { PathDataCommand } from "./path-data-command";
import { APathDataCommand } from "./apath-data-command";
import { MPathDataCommand } from "./mpath-data-command";
import { LPathDataCommand } from "./lpath-data-command";
import { TPathDataCommand } from "./tpath-data-command";
import { CPathDataCommand } from "./cpath-data-command";
import { QPathDataCommand } from "./qpath-data-command";
import { SPathDataCommand } from "./spath-data-command";
import { HPathDataCommand } from "./hpath-data-command";
import { VPathDataCommand } from "./vpath-data-command";

export class PathData {
  constructor(public commands: PathDataCommand[] = null) {}
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
    if (type === "A" || type === "a") {
      return new APathDataCommand(type, values);
    } else if (type === "M" || type === "m") {
      return new MPathDataCommand(type, values);
    } else if (type === "L" || type === "l") {
      return new LPathDataCommand(type, values);
    } else if (type === "T" || type === "t") {
      return new TPathDataCommand(type, values);
    } else if (type === "C" || type === "c") {
      return new CPathDataCommand(type, values);
    } else if (type === "Q" || type === "q") {
      return new QPathDataCommand(type, values);
    } else if (type === "S" || type === "s") {
      return new SPathDataCommand(type, values);
    } else if (type === "H" || type === "h") {
      return new HPathDataCommand(type, values);
    } else if (type === "V" || type === "v") {
      return new VPathDataCommand(type, values);
    } else {
      return new PathDataCommand(type, values);
    }
  }

  /**
   * Get path data and set absolute version for each point.
   * @param pathData arguments.
   */
  public static analyze(pathData: PathData | Array<any>): PathData {
    if (!pathData) {
      return null;
    }

    const data =
      pathData instanceof PathData
        ? (pathData as PathData)
        : new PathData(
            pathData
              .filter((p) => !!p)
              .map((p) => PathData.wrapCommand(p.type, p.values))
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
    let prev: PathDataCommand = null;
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
      } else if (type === "a" || type === "A") {
        const absolute = type === "A";
        let x = seg.values[seg.values.length - 2];
        let y = seg.values[seg.values.length - 1];
        if (!absolute) {
          x += curX;
          y += curY;
        }
        const cloned = [
          seg.values[0],
          seg.values[1],
          seg.values[2],
          seg.values[3],
          seg.values[4],
          x,
          y,
        ];
        if (!absolute) {
          seg.absolute = PathData.wrapCommand("A", cloned) as APathDataCommand;
        }

        const c = seg.getAbsolute() as APathDataCommand;
        const abs = prev.getAbsolute().p;
        // TODO: move to the type by itself.
        c.center = Utils.ellipseCenter(
          abs.x,
          abs.y,
          c.r.x,
          c.r.y,
          c.rotation,
          c.large ? 0 : 1,
          c.sweep ? 0 : 1,
          x,
          y
        );
        curX = x;
        curY = y;
      } else if (type === "H") {
        curX = seg.values[0];
        seg.setPointValues(curX, curY);
      } else if (type === "V") {
        curY = seg.values[0];
        seg.setPointValues(curX, curY);
      } else if (type === "h") {
        const x = curX + seg.values[0];
        seg.absolute = PathData.wrapCommand(type.toUpperCase(), [x]);
        curX = x;
        seg.absolute.setPointValues(curX, curY);
      } else if (type === "v") {
        const y = curY + seg.values[0];
        seg.absolute = PathData.wrapCommand(type.toUpperCase(), [y]);
        curY = y;
        seg.absolute.setPointValues(curX, curY);
      } else if (type === "Z" || type === "z") {
        seg.absolute = PathData.wrapCommand("Z");
        curY = subPath.y;
        curX = subPath.x;
      }

      prev = seg;
    });

    return data;
  }

  /**
   * recalculate self.
   */
  recalculate(): PathData {
    return PathData.analyze(this);
  }
}
