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
