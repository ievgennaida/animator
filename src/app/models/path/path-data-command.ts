import { Utils } from "src/app/services/utils/utils";
import { PathType } from "src/app/models/path/path-type";
// Should be replaced by a DOM type when available.
export interface SVGPathSegmentEx {
  type: string;
  values: number[];
}

export class PathDataCommand implements SVGPathSegmentEx {
  constructor(public type: string, public values: number[] = []) {}
  public selected = false;
  // tslint:disable-next-line: variable-name
  private _r: DOMPoint;
  // tslint:disable-next-line: variable-name
  private _center: DOMPoint | null = null;
  // tslint:disable-next-line: variable-name
  public _a: DOMPoint;
  // tslint:disable-next-line: variable-name
  public _b: DOMPoint;
  // tslint:disable-next-line: variable-name
  public _x = 0;
  // tslint:disable-next-line: variable-name
  public _y = 0;
  /**
   * absolute version of current command.
   */
  public absolute: PathDataCommand;
  prev: PathDataCommand;
  public clone(): PathDataCommand {
    const cloned = new PathDataCommand(this.type, [...this.values]);
    if (this.absolute) {
      cloned.absolute = this.absolute.clone();
    }
    return cloned;
  }
  public offset(x: number, y: number) {
    this.x += x;
    this.y += y;
  }

  public get x(): number {
    if (this.values) {
      if (
        this.type === PathType.horizontal ||
        this.type === PathType.horizontalAbs
      ) {
        return this.values[0];
      } else if (
        this.type === PathType.vertical ||
        this.type === PathType.verticalAbs
      ) {
        if (this.isAbsolute()) {
          if (this.prev) {
            const abs = this.prev.getAbsolute();
            if (abs) {
              return abs.x;
            }
          }
        }
        return 0;
      }

      if (this.values.length >= 2) {
        return this.values[this.values.length - 2];
      }
    }
    return 0;
  }
  public set x(val: number) {
    if (this.values) {
      this._center = null;
      if (
        this.type === PathType.horizontal ||
        this.type === PathType.horizontalAbs
      ) {
        this.values[0] = val;
        return;
      } else if (
        this.type === PathType.vertical ||
        this.type === PathType.verticalAbs
      ) {
        this._x = val;
        return;
      }
      if (this.values.length >= 2) {
        this.values[this.values.length - 2] = val;
      }
    }
  }
  public get y(): number {
    if (this.values) {
      if (
        this.type === PathType.vertical ||
        this.type === PathType.verticalAbs
      ) {
        return this.values[0];
      } else if (
        this.type === PathType.horizontal ||
        this.type === PathType.horizontalAbs
      ) {
        if (this.isAbsolute()) {
          if (this.prev) {
            const abs = this.prev.getAbsolute();
            if (abs) {
              return abs.y;
            }
          }
        }

        return 0;
      }
      if (this.values.length >= 2) {
        return this.values[this.values.length - 1];
      }
    }
    return 0;
  }
  public set y(val: number) {
    this._center = null;
    if (this.type === PathType.vertical || this.type === PathType.verticalAbs) {
      this.values[0] = val;
      return;
    } else if (
      this.type === PathType.horizontal ||
      this.type === PathType.horizontalAbs
    ) {
      this._y = val;
      return;
    }
    if (this.values && this.values.length >= 2) {
      this.values[this.values.length - 1] = val;
    }
  }
  public set p(point: DOMPoint) {
    this.setPointValues(point.x, point.y);
  }
  public get p(): DOMPoint {
    if (!this.values) {
      return null;
    }
    return new DOMPoint(this.x, this.y);
  }
  public setPointValues(x: number, y: number) {
    this.x = x;
    this.y = y;
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

  public get a(): DOMPoint | null {
    if (
      this.type === PathType.arc ||
      this.type === PathType.arcAbs ||
      (this.values && this.values.length < 3)
    ) {
      return null;
    }

    if (!this._a) {
      this._a = new DOMPoint();
    }
    this._a.x = this.values[0];
    this._a.y = this.values[1];
    return this._a;
  }
  public set a(point: DOMPoint) {
    this._a = point;
    if (this.values && this.values.length >= 3) {
      this.values[0] = point.x;
      this.values[1] = point.y;
      this._center = null;
    }
  }

  public get b(): DOMPoint | null {
    if (
      this.type === PathType.arc ||
      this.type === PathType.arcAbs ||
      (this.values && this.values.length < 5)
    ) {
      return null;
    }
    if (!this._b) {
      this._b = new DOMPoint();
    }
    this._b.x = this.values[2];
    this._b.y = this.values[3];
    return this._b;
  }
  public set b(point: DOMPoint) {
    this._b = point;
    this.values[2] = point.x;
    this.values[3] = point.y;
    this._center = null;
  }

  public offsetHandles(x: number, y: number) {
    if (this.type === PathType.arc || this.type === PathType.arcAbs) {
      return;
    }
    const a = this.a;
    if (a) {
      a.x += x;
      a.y += y;
      this.a = a;
    }
    const b = this.b;
    if (b) {
      b.x += x;
      b.y += y;
      this.b = b;
    }
  }

  /**
   * Arc center
   */
  public get center(): DOMPoint {
    if (this._center) {
      return this._center;
    }
    const c = this.getAbsolute();
    let absX = 0;
    let absY = 0;
    // can be first segment
    if (this.prev) {
      const prevAbs = this.prev.getAbsolute();
      if (prevAbs) {
        absX = prevAbs.x;
        absY = prevAbs.y;
      }
    }

    this._center = Utils.ellipseCenter(
      absX,
      absY,
      c.r.x,
      c.r.y,
      c.rotation,
      c.large ? 0 : 1,
      c.sweep ? 0 : 1,
      c.x,
      c.y
    );

    return this._center;
  }

  public getRel(x: number | null, y: number | null): DOMPoint | null {
    if (x === null || y === null) {
      return null;
    }
    if (this.prev) {
      const prevAbs = this.prev.getAbsolute();
      if (prevAbs) {
        const point = prevAbs.p as DOMPoint;
        if (point) {
          x = x - point.x;
          y = y - point.y;
        }
      }
    }
    return new DOMPoint(x, y);
  }
  public calculateRelPoint(): DOMPoint {
    const abs = this.getAbsolute();
    return this.getRel(abs ? abs.x : 0, abs ? abs.y : 0);
  }
  /** Arc rotation point. */
  public get r(): DOMPoint {
    if (!this._r) {
      this._r = new DOMPoint();
    }

    this._r.x = this.values[0];
    this._r.y = this.values[1];
    return this._r;
  }
  public set r(point: DOMPoint) {
    this._r = point;
    this.values[0] = point.x;
    this.values[1] = point.y;
    this._center = null;
  }
  /**
   * the x-axis of the ellipse is rotated by x-axis-rotation
   * degrees relative to the x-axis of the current coordinate system.
   */
  public get rotation(): number {
    return this.values[2];
  }
  public set rotation(val: number) {
    this.values[2] = val;
    this._center = null;
  }
  public get large(): number {
    return this.values[3];
  }
  public set large(val: number) {
    this.values[3] = val;
    this._center = null;
  }
  /**
   * If sweep-flag is '1', then the arc will be drawn in a "positive-angle"
   * direction (i.e., the ellipse formula x=cx+rx*cos(theta) and y=cy+ry*sin(theta)
   * is evaluated such that theta starts at an angle corresponding to the current point
   * and increases positively until the arc reaches
   */
  public get sweep(): boolean {
    return this.values[4] === 1;
  }
  public set sweep(val: boolean) {
    if (val) {
      this.values[4] = 1;
    } else {
      this.values[4] = 0;
    }
    this._center = null;
  }
}
