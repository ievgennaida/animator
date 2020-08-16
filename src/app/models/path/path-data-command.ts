/**
 * SVG path commands
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
 * https://www.w3.org/TR/SVG/paths.html
 */

// tslint:disable: variable-name
import { Utils } from "src/app/services/utils/utils";
import { PathType } from "src/app/models/path/path-type";
import { PointOnPathUtils } from "src/app/models/path/utils/point-on-path";
// Should be replaced by a DOM type when available.
export interface SVGPathSegmentEx {
  type: string;
  values: number[];
}

export class PathDataCommand implements SVGPathSegmentEx {
  constructor(public type: string | PathType, public values: number[] = []) {}
  private _r: DOMPoint;
  public _a: DOMPoint;
  public _b: DOMPoint;
  public _x = 0;
  public _y = 0;

  private pointsCache = new Map<number, DOMPoint>();
  /**
   * Cached segment length.
   */
  public _length: number | null = null;
  /**
   * Cached calculated arc center.
   */
  private _center: DOMPoint | null = null;
  /**
   * absolute version of current command.
   */
  public absolute: PathDataCommand;
  prev: PathDataCommand;
  /**
   * Cleanup cached calculations.
   */
  private cleanCache() {
    this._center = null;
    this._length = null;
    this.pointsCache.clear();
  }
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
      this.cleanCache();
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
    this.cleanCache();
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
    // Calculate virtual
    const prevAbs = this.prev ? this.prev.getAbsolute() : null;
    if (
      // S command
      this.type === PathType.shorthandSmooth ||
      this.type === PathType.shorthandSmoothAbs
    ) {
      if (!prevAbs) {
        return null;
      }
      /**
       * The start control point is a reflection of the end control point of the previous curve command.
       * If the previous command wasn't a cubic Bézier curve, the start control point
       * is the same as the curve starting point (current point).
       */
      if (
        prevAbs.type === PathType.shorthandSmoothAbs ||
        prevAbs.type === PathType.cubicBezierAbs
      ) {
        const b = prevAbs.b;
        // For this mode handle point is calculated.
        const virtualHandle = new DOMPoint(
          2 * prevAbs.x - b.x,
          2 * prevAbs.y - b.y
        );
        return virtualHandle;
      } else {
        // NOTE: can be prev point. Should be checked
        return new DOMPoint(prevAbs.x, prevAbs.y);
      }
    } else if (
      // T command
      this.type === PathType.smoothQuadraticBezier ||
      this.type === PathType.smoothQuadraticBezierAbs
    ) {
      if (
        (prevAbs && prevAbs.type === PathType.smoothQuadraticBezierAbs) ||
        prevAbs.type === PathType.quadraticBezierAbs
      ) {
        // The control point is a reflection of the control point of the previous curve command.
        // 2 * cur[0] - prev_point[0],
        // 2 * cur[1] - prev_point[1],
        const a = prevAbs.a;
        const virtualHandle = new DOMPoint(
          2 * prevAbs.x - a.x,
          2 * prevAbs.y - a.y
        );
        return virtualHandle;
      } else {
        return new DOMPoint(this.x, this.y);
      }
    } else if (
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
    // Clean cached point.
    this._a = null;
    if (
      // S command
      this.type === PathType.shorthandSmooth ||
      this.type === PathType.shorthandSmoothAbs
    ) {
      // Virtual point
      return;
    } else if (
      // T command
      this.type === PathType.smoothQuadraticBezier ||
      this.type === PathType.smoothQuadraticBezierAbs
    ) {
      // Virtual point
      return;
    }

    if (this.values && this.values.length >= 3) {
      this.values[0] = point.x;
      this.values[1] = point.y;
      this.cleanCache();
    }
  }

  public get b(): DOMPoint | null {
    if (
      this.type === PathType.arc ||
      this.type === PathType.arcAbs ||
      !this.values
    ) {
      return null;
    }

    if (
      this.type === PathType.shorthandSmooth ||
      this.type === PathType.shorthandSmoothAbs
    ) {
      if (!this._b) {
        this._b = new DOMPoint();
      }
      // The end control point is specified differently for the S command.
      this._b.x = this.values[0];
      this._b.y = this.values[1];
    } else if (this.values.length >= 6) {
      if (!this._b) {
        this._b = new DOMPoint();
      }
      this._b.x = this.values[2];
      this._b.y = this.values[3];
    } else {
      return null;
    }

    return this._b;
  }
  public set b(point: DOMPoint) {
    this._b = null;
    if (point) {
      if (
        this.type === PathType.shorthandSmooth ||
        this.type === PathType.shorthandSmoothAbs
      ) {
        this.values[0] = point.x;
        this.values[1] = point.y;
      } else {
        this.values[2] = point.x;
        this.values[3] = point.y;
      }
    }

    this.cleanCache();
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

  public get absPrevPoint(): DOMPoint {
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

    return { x: absX, y: absY } as DOMPoint;
  }
  /**
   * Arc center
   */
  public get center(): DOMPoint {
    if (this._center) {
      return this._center;
    }
    const c = this.getAbsolute();
    const prevAbs = this.absPrevPoint;

    this._center = Utils.ellipseCenter(
      prevAbs.x,
      prevAbs.y,
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
  /**
   * get segment length
   */
  public get length(): number {
    if (this._length) {
      return this._length;
    }

    this._length = PointOnPathUtils.getSegmentLength(this);

    return this._length;
  }

  public getPointOnPath(fractionLength: number): DOMPoint {
    // TODO: cache until moved or deselected.
    const toReturn = this.pointsCache.get(fractionLength);
    if (toReturn) {
      return toReturn;
    }
    const point = PointOnPathUtils.getPointOnPath(
      this,
      fractionLength,
      this.length
    );
    if (point) {
      this.pointsCache.set(fractionLength, point);
    }
    return point;
  }
  public getRel(x: number | null, y: number | null): DOMPoint | null {
    if (x === null || y === null) {
      return null;
    }
    if (this.prev) {
      const prevAbs = this.prev.getAbsolute();
      if (prevAbs) {
        const point = prevAbs.p;
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
  public calculateRelA(): DOMPoint {
    const abs = this.getAbsolute();
    const a = abs.a;
    return this.getRel(a ? a.x : null, a ? a.y : null);
  }
  public calculateRelB(): DOMPoint {
    const abs = this.getAbsolute();
    const b = abs.b;
    return this.getRel(b ? b.x : null, b ? b.y : null);
  }
  /** Arc radius point. */
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
    this.cleanCache();
  }

  /**
   * Arc radius can be set but cannot be less than a distance between path segments.
   */
  public getCalculatedRadius(): DOMPoint {
    // TODO: improve this by a real calculation of a radius.
    return this.r;
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
    this.cleanCache();
  }
  public get large(): boolean {
    return this.values[3] === 1;
  }
  public set large(val: boolean) {
    this.values[3] = val ? 1 : 0;
    this.cleanCache();
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
    this.cleanCache();
  }

  public toString(): string {
    if (this.values && this.values.length > 0) {
      return this.type + " " + this.values.join(" ");
    }

    return this.type;
  }

  /**
   * Get path data command bounds.
   */
  public getBounds(): DOMRect {
    const abs = this.getAbsolute();
    if (abs.type === PathType.moveAbs) {
      return null;
    }
    const prev = this.absPrevPoint;
    const p = abs.p;
    const a = abs.a;
    const b = abs.b;

    let minX = Math.min(prev.x, p.x);
    let maxX = Math.max(prev.x, p.x);
    let minY = Math.min(prev.y, p.y);
    let maxY = Math.max(prev.y, p.y);

    if (a) {
      minX = Math.min(a.x, minX);
      maxX = Math.max(a.x, maxX);
      minY = Math.min(a.y, minY);
      maxY = Math.max(a.y, maxY);
    }

    if (b) {
      minX = Math.min(b.x, minX);
      maxX = Math.max(b.x, maxX);
      minY = Math.min(b.y, minY);
      maxY = Math.max(b.y, maxY);
    }
    if (abs.type === PathType.arcAbs) {
      // TODO: calculate bounding box of arc
      const r = this.getCalculatedRadius();
      const centerArc = this.center;
      minX = Math.min(centerArc.x + r.x, minX);
      minX = Math.max(centerArc.x - r.x, minX);
      minY = Math.min(centerArc.y + r.y, minY);
      maxY = Math.max(centerArc.y - r.y, maxY);
      // TODO: return nothing for now
      return null;
    }
    const toReturn = new DOMRect(
      minX,
      minY,
      Math.max(maxX - minX, 1),
      Math.max(maxY - minY, 1)
    );
    return toReturn;
  }
}
