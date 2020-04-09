import { nullLayer } from "src/app/models/Lottie/layers/nullLayer";

// Should be replaced by a DOM type when avaliable.
export interface SVGPathSegmentEx {
  type: string;
  values: number[];
}
export class PathDataCommand implements SVGPathSegmentEx {
  constructor(public type: string, public values: number[]) {}
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

    let currentX = 0;
    let currentY = 0;

    let subpathX = null;
    let subpathY = null;

    data.commands.forEach((seg) => {
      const type = seg.type;

      if (type === "M") {
        const x = seg.values[0];
        const y = seg.values[1];
        seg.absolute = new PathDataCommand("M", [x, y]);

        subpathX = x;
        subpathY = y;

        currentX = x;
        currentY = y;
      } else if (type === "m") {
        const x = currentX + seg.values[0];
        const y = currentY + seg.values[1];

        seg.absolute = new PathDataCommand("M", [x, y]);

        subpathX = x;
        subpathY = y;

        currentX = x;
        currentY = y;
      } else if (type === "L") {
        const x = seg.values[0];
        const y = seg.values[1];

        seg.absolute = new PathDataCommand("L", [x, y]);

        currentX = x;
        currentY = y;
      } else if (type === "l") {
        const x = currentX + seg.values[0];
        const y = currentY + seg.values[1];

        seg.absolute = new PathDataCommand("L", [x, y]);

        currentX = x;
        currentY = y;
      } else if (type === "C") {
        const x1 = seg.values[0];
        const y1 = seg.values[1];
        const x2 = seg.values[2];
        const y2 = seg.values[3];
        const x = seg.values[4];
        const y = seg.values[5];

        seg.absolute = new PathDataCommand("C", [x1, y1, x2, y2, x, y]);

        currentX = x;
        currentY = y;
      } else if (type === "c") {
        const x1 = currentX + seg.values[0];
        const y1 = currentY + seg.values[1];
        const x2 = currentX + seg.values[2];
        const y2 = currentY + seg.values[3];
        const x = currentX + seg.values[4];
        const y = currentY + seg.values[5];

        seg.absolute = new PathDataCommand("C", [x1, y1, x2, y2, x, y]);

        currentX = x;
        currentY = y;
      } else if (type === "Q") {
        const x1 = seg.values[0];
        const y1 = seg.values[1];
        const x = seg.values[2];
        const y = seg.values[3];

        seg.absolute = new PathDataCommand("Q", [x1, y1, x, y]);

        currentX = x;
        currentY = y;
      } else if (type === "q") {
        const x1 = currentX + seg.values[0];
        const y1 = currentY + seg.values[1];
        const x = currentX + seg.values[2];
        const y = currentY + seg.values[3];

        seg.absolute = new PathDataCommand("Q", [x1, y1, x, y]);

        currentX = x;
        currentY = y;
      } else if (type === "A") {
        const x = seg.values[5];
        const y = seg.values[6];

        seg.absolute = new PathDataCommand("A", [
          seg.values[0],
          seg.values[1],
          seg.values[2],
          seg.values[3],
          seg.values[4],
          x,
          y,
        ]);

        currentX = x;
        currentY = y;
      } else if (type === "a") {
        const x = currentX + seg.values[5];
        const y = currentY + seg.values[6];

        seg.absolute = new PathDataCommand("A", [
          seg.values[0],
          seg.values[1],
          seg.values[2],
          seg.values[3],
          seg.values[4],
          x,
          y,
        ]);

        currentX = x;
        currentY = y;
      } else if (type === "H") {
        const x = seg.values[0];
        seg.absolute = new PathDataCommand("H", [x]);
        currentX = x;
      } else if (type === "h") {
        const x = currentX + seg.values[0];
        seg.absolute = new PathDataCommand("H", [x]);
        currentX = x;
      } else if (type === "V") {
        const y = seg.values[0];
        seg.absolute = new PathDataCommand("V", [y]);
        currentY = y;
      } else if (type === "v") {
        const y = currentY + seg.values[0];
        seg.absolute = new PathDataCommand("V", [y]);
        currentY = y;
      } else if (type === "S") {
        const x2 = seg.values[0];
        const y2 = seg.values[1];
        const x = seg.values[2];
        const y = seg.values[3];

        seg.absolute = new PathDataCommand("S", [x2, y2, x, y]);

        currentX = x;
        currentY = y;
      } else if (type === "s") {
        const x2 = currentX + seg.values[0];
        const y2 = currentY + seg.values[1];
        const x = currentX + seg.values[2];
        const y = currentY + seg.values[3];

        seg.absolute = new PathDataCommand("S", [x2, y2, x, y]);

        currentX = x;
        currentY = y;
      } else if (type === "T") {
        const x = seg.values[0];
        const y = seg.values[1];

        seg.absolute = new PathDataCommand("T", [x, y]);

        currentX = x;
        currentY = y;
      } else if (type === "t") {
        const x = currentX + seg.values[0];
        const y = currentY + seg.values[1];

        seg.absolute = new PathDataCommand("T", [x, y]);

        currentX = x;
        currentY = y;
      } else if (type === "Z" || type === "z") {
        seg.absolute = new PathDataCommand("Z", []);

        currentX = subpathX;
        currentY = subpathY;
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
