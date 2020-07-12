// Should be replaced by a DOM type when available.
export interface SVGPathSegmentEx {
  type: string;
  values: number[];
}

export class PathDataCommand implements SVGPathSegmentEx {
  constructor(public type: string, public values: number[] = []) {}
  public selected = false;

  /**
   * absolute version of current command.
   */
  public absolute: PathDataCommand;
  prev: PathDataCommand;
  next: PathDataCommand;

  public offset(x: number, y: number) {
    this.x += x;
    this.y += y;
  }
  public offsetHandles(x: number, y: number) {}
  public get x(): number {
    if (this.values && this.values.length >= 2) {
      return this.values[this.values.length - 2];
    }
    return 0;
  }
  public set x(val: number) {
    if (this.values && this.values.length >= 2) {
      this.values[this.values.length - 2] = val;
    }
  }
  public get y(): number {
    if (this.values && this.values.length >= 2) {
      return this.values[this.values.length - 1];
    }
    return 0;
  }
  public set y(val: number) {
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
}
export class OneHandleDataCommand extends PathDataCommand {
  // tslint:disable-next-line: variable-name
  public _a: DOMPoint;
  public get a(): DOMPoint {
    if (!this._a) {
      this._a = new DOMPoint();
    }
    this._a.x = this.values[0];
    this._a.y = this.values[1];
    return this._a;
  }
  public set a(point: DOMPoint) {
    this._a = point;
    this.values[0] = point.x;
    this.values[1] = point.y;
  }

  public offsetHandles(x: number, y: number) {
    super.offsetHandles(x, y);
    const a = this.a;
    a.x += x;
    a.y += y;
    this.a = a;
  }
}
