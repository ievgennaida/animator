import { Utils } from "./utils";

// Should be replaced by a DOM type when avaliable.
export interface SVGPathSegmentEx {
  type: string;
  values: number[];
}

export class PathDataCommand implements SVGPathSegmentEx {
  constructor(public type: string, public values: number[] = []) {
    this.p = this.getPoint(type, values);
    this.update();
  }

  public p: DOMPoint;
  /**
   * absolute version of current command.
   */
  public absolute: PathDataCommand;
  public update() {}
  public getPoint(type: string, values: Array<number>): DOMPoint {
    if (!values) {
      return null;
    }
    if (values.length >= 2) {
      return new DOMPoint(values[values.length - 2], values[values.length - 1]);
    } else if (values.length === 1) {
      if (type === "H" || type === "h") {
        return new DOMPoint(values[0], 0);
      } else {
        return new DOMPoint(0, values[0]);
      }
    }
    return null;
  }

  public setPoint(values: Array<number>, point: DOMPoint) {
    if (values && values.length >= 2) {
      values[values.length - 2] = point.x;
      values[values.length - 1] = point.y;
    }

    return null;
  }

  /**
   * Path data should be analyzed first.
   */
  public getAbsolute(): PathDataCommand {
    if (this.isAbsolute()) {
      return this;
    } else {
      return this.absolute;
    }
  }

  public isAbsolute() {
    if (!this.type || this.type.length === 0) {
      return true;
    }
    const code = this.type.charCodeAt(0);
    return code >= 65 && code <= 90;
  }
}
export class LPathDataCommand extends PathDataCommand {}
export class MPathDataCommand extends PathDataCommand {}
export class HPathDataCommand extends PathDataCommand {}
export class VPathDataCommand extends PathDataCommand {}

/**
 * Shorthand/smooth quadratic Bezier curveto
 */
export class TPathDataCommand extends PathDataCommand {}
/**
 * W3 https://www.w3.org/TR/SVG/paths.html
 * Draws a cubic Bézier curve from the current point to (x,y)
 * using (x1,y1) as the control point at the beginning of the curve and (x2,y2)
 * as the control point at the end of the curve. C (uppercase)
 * indicates that absolute coordinates will follow; c (lowercase)
 * indicates that relative coordinates will follow.
 * Multiple sets of coordinates may be specified to draw a polybézier.
 * At the end of the command, the new current point becomes the final (x,y)
 * coordinate pair used in the polybézier.
 */
export class CPathDataCommand extends PathDataCommand {
  public a: DOMPoint;
  public b: DOMPoint;
  update() {
    if (!this.a) {
      this.a = new DOMPoint();
    }
    if (!this.b) {
      this.b = new DOMPoint();
    }
    this.a.x = this.values[0];
    this.a.y = this.values[1];
    this.b.x = this.values[2];
    this.b.y = this.values[3];
  }
}
/**
 * S shorthand/smooth curveto (x2 y2 x y)+
 */
export class SPathDataCommand extends PathDataCommand {
  public a: DOMPoint;
  update() {
    if (!this.a) {
      this.a = new DOMPoint();
    }
    this.a.x = this.values[0];
    this.a.y = this.values[1];
  }
}

/**
 * quadratic Bézier curveto.
 * Draws a quadratic Bézier curve from the current point to (x,y) using (x1,y1)
 * as the control point. Q (uppercase) indicates that absolute coordinates will follow;
 * q (lowercase) indicates that relative coordinates will follow.
 */
export class QPathDataCommand extends PathDataCommand {
  public a: DOMPoint;
  update() {
    if (!this.a) {
      this.a = new DOMPoint();
    }
    this.a.x = this.values[0];
    this.a.y = this.values[1];
  }
}

export class APathDataCommand extends PathDataCommand {
  constructor(public type: string, public values: number[] = []) {
    super(type, values);
  }
  public center: DOMPoint;
  public r: DOMPoint;
  /**
   * the x-axis of the ellipse is rotated by x-axis-rotation
   * degrees relative to the x-axis of the current coordinate system.
   */
  public rotation: number;
  public large: number;
  /**
   * If sweep-flag is '1', then the arc will be drawn in a "positive-angle"
   * direction (i.e., the ellipse formula x=cx+rx*cos(theta) and y=cy+ry*sin(theta)
   * is evaluated such that theta starts at an angle corresponding to the current point
   * and increases positively until the arc reaches
   */
  public sweep: number;
  update() {
    if (!this.r) {
      this.r = new DOMPoint();
    }
    this.r.x = this.values[0];
    this.r.y = this.values[1];
    this.rotation = this.values[2];
    this.large = this.values[3];
    this.sweep = this.values[4];
  }
}

export class PathData {
  constructor(public commands: PathDataCommand[] = null) {}
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

    let subpath = new DOMPoint();
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
        curX = seg.p.x;
        curY = seg.p.y;

        if (isMove) {
          subpath = seg.p;
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
          subpath = point;
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
        seg.p = new DOMPoint(curX, curY);
      } else if (type === "V") {
        curY = seg.values[0];
        seg.p = new DOMPoint(curX, curY);
      } else if (type === "h") {
        const x = curX + seg.values[0];
        seg.absolute = PathData.wrapCommand(type.toUpperCase(), [x]);
        curX = x;
        seg.absolute.p.x = curX;
        seg.absolute.p.y = curY;
      } else if (type === "v") {
        const y = curY + seg.values[0];
        seg.absolute = PathData.wrapCommand(type.toUpperCase(), [y]);
        curY = y;
        seg.absolute.p.x = curX;
        seg.absolute.p.y = curY;
      } else if (type === "Z" || type === "z") {
        seg.absolute = PathData.wrapCommand("Z");
        curY = subpath.y;
        curX = subpath.x;
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
