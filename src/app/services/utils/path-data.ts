// Should be replaced by a DOM type when avaliable.
export interface SVGPathSegmentEx {
  type: string;
  values: number[];
}
export class PathDataCommand implements SVGPathSegmentEx {
  constructor(public type: string, public values: number[] = []) {
    this.point = this.getPoint(type, values);
  }
  point: DOMPoint = null;
  /**
   * absolute version of current command.
   */
  public absolute: PathDataCommand;
  public static wrap(element: any): PathDataCommand {
    if (!element) {
      return null;
    }

    return new PathDataCommand(element.type, element.values);
  }

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
  public z(): boolean {
    return this.type === "z" || this.type === "Z";
  }
  public M(): boolean {
    return this.type === "M";
  }
  public m(): boolean {
    return this.type === "m";
  }
  public L(): boolean {
    return this.type === "L";
  }
  public l(): boolean {
    return this.type === "l";
  }
  public C(): boolean {
    return this.type === "C";
  }
  public c(): boolean {
    return this.type === "c";
  }
  public Q(): boolean {
    return this.type === "Q";
  }
  public q(): boolean {
    return this.type === "q";
  }
  public A(): boolean {
    return this.type === "A";
  }
  public a(): boolean {
    return this.type === "a";
  }
  public H(): boolean {
    return this.type === "H";
  }
  public h(): boolean {
    return this.type === "h";
  }
  public V(): boolean {
    return this.type === "V";
  }
  public v(): boolean {
    return this.type === "v";
  }
  public S(): boolean {
    return this.type === "S";
  }
  public s(): boolean {
    return this.type === "s";
  }
  public T(): boolean {
    return this.type === "T";
  }
  public t(): boolean {
    return this.type === "t";
  }
}

export class PathData {
  constructor(public commands: PathDataCommand[] = null) {}
  public static wrap(elements: Array<any>): PathData {
    if (!elements || !Array.isArray(elements)) {
      return null;
    }

    return PathData.analyze(elements) as PathData;
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
        : new PathData(pathData.map((p) => PathDataCommand.wrap(p)));

    if (!data || !data.commands) {
      if (!data.commands) {
        data.commands = [];
      }
      return data as PathData;
    }

    let curX = 0;
    let curY = 0;

    let subpath = new DOMPoint();

    data.commands.forEach((seg) => {
      const type = seg.type;
      const isMove = type === "m" || type === "M";
      if (
        type === "M" ||
        type === "L" ||
        type === "T" ||
        type === "C" ||
        type === "Q" ||
        type === "A" ||
        type === "S"
      ) {
        curX = seg.point.x;
        curY = seg.point.y;

        if (isMove) {
          subpath = seg.point;
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
        seg.absolute = new PathDataCommand(type.toUpperCase(), clonedArray);
        const point = seg.absolute.point;
        curX = point.x;
        curY = point.y;
        if (isMove) {
          subpath = point;
        }
      } else if (type === "a") {
        const x = curX + seg.values[5];
        const y = curY + seg.values[6];

        seg.absolute = new PathDataCommand("A", [
          seg.values[0],
          seg.values[1],
          seg.values[2],
          seg.values[3],
          seg.values[4],
          x,
          y,
        ]);

        curX = x;
        curY = y;
      } else if (type === "H") {
        curX = seg.values[0];
        seg.point = new DOMPoint(curX, curY);
      } else if (type === "V") {
        curY = seg.values[0];
        seg.point = new DOMPoint(curX, curY);
      } else if (type === "h") {
        const x = curX + seg.values[0];
        seg.absolute = new PathDataCommand(type.toUpperCase(), [x]);
        curX = x;
        seg.absolute.point.x = curY;
        seg.absolute.point.y = curX;
      } else if (type === "v") {
        const y = curY + seg.values[0];
        seg.absolute = new PathDataCommand(type.toUpperCase(), [y]);
        curY = y;
        seg.absolute.point.x = curY;
        seg.absolute.point.y = curX;
      } else if (type === "Z" || type === "z") {
        seg.absolute = new PathDataCommand("Z");
        curY = subpath.y;
        curX = subpath.x;
      }
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
