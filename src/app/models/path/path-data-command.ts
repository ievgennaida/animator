/**
 * SVG path commands
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
 * https://www.w3.org/TR/SVG/paths.html
 */

/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
import { PathType } from "src/app/models/path/path-type";
import { arcToCubicCurves } from "src/app/services/utils/path-utils/arc-functions";
import { PointOnPathUtils } from "src/app/services/utils/path-utils/point-on-path";
import { CalculatedEllipse, Utils } from "src/app/services/utils/utils";
import { PathData } from "./path-data";
import { SVGPathSegmentEx } from "./svg-path-segment-ex";

/**
 * Path data command (represents segment of a path data).
 * Editor is always working with the absolute values.
 * But nevertheless editor is trying to preserve the original
 * relative or absolute by setting saveAsRelative.
 */
export class PathDataCommand implements SVGPathSegmentEx {
  public _a: DOMPoint | null = null;
  public _b: DOMPoint | null = null;
  public _x = 0;
  public _y = 0;

  /**
   * Cached segment length.
   */
  public _length: number | null = null;
  /*
   * Editor is working with absolute values.
   * This is a type of the initial command to preserve original rel or abs when saved.
   */
  saveAsRelative = false;
  /**
   * Cached calculated arc center and rx, ry.
   * Smaller Rx and Ry can be given for a command than the expected one.
   */
  private ellipseCache: CalculatedEllipse | null = null;
  private approxCurves: number[][] | null = null;
  private pointsCache = new Map<number, DOMPoint>();
  /**
   * Indication whether control point A is changed.
   * Used for changes tracking.
   */
  private _changedA = false;
  private _changedB = false;
  private _changedP = false;
  constructor(
    public type: PathType | string,
    public values: number[] = [],
    public pathData: PathData | null = null
  ) {
    this.saveAsRelative = this.isRelative(type);
  }

  static isType(
    commandType: PathType | string,
    type: PathType | string,
    ignoreAbs = true
  ): boolean {
    const same =
      commandType === type ||
      (ignoreAbs &&
        commandType.toUpperCase() === type.toString().toUpperCase());
    return same;
  }
  static isAbsolutePathCommand(type: PathType | string): boolean {
    if (!type || type.length === 0) {
      return true;
    }
    const code = type.charCodeAt(0);
    return code >= 65 && code <= 90;
  }

  get prev(): PathDataCommand | null {
    const i = this.index - 1;
    if (
      this.pathData &&
      this.pathData.commands &&
      i >= 0 &&
      i < this.pathData.commands.length
    ) {
      return this.pathData.commands[i];
    }
    return null;
  }
  get next(): PathDataCommand | null {
    const i = this.index + 1;
    if (
      this.pathData &&
      this.pathData.commands &&
      i >= 0 &&
      i < this.pathData.commands.length
    ) {
      return this.pathData.commands[i];
    }
    return null;
  }

  getAllPrevCommands(): PathDataCommand[] {
    const toReturn: PathDataCommand[] = [];
    let value = this.prev;
    while (value) {
      toReturn.push(value);
      value = value.prev;
    }
    return toReturn;
  }

  getAllNextCommands(): PathDataCommand[] {
    const toReturn: PathDataCommand[] = [];
    let value = this.next;
    while (value) {
      toReturn.push(value);
      value = value.next;
    }
    return toReturn;
  }
  /*
  public get node(): TreeNode | null {
    return this.pathData?.node | null;
  }*/
  public get index(): number {
    if (!this.pathData || !this.pathData.commands) {
      return -1;
    }
    return this.pathData.commands.indexOf(this);
  }

  public cloneCommand(): PathDataCommand {
    const cloned = new PathDataCommand(this.type, [...this.values]);
    cloned.saveAsRelative = this.saveAsRelative;
    return cloned;
  }
  public offset(x: number, y: number) {
    this.x += x;
    this.y += y;
  }

  public get x(): number {
    if (this.values) {
      if (this.isType(PathType.horizontalAbs)) {
        return this.values[0];
      } else if (
        this.isType(PathType.verticalAbs) ||
        this.isType(PathType.closeAbs)
      ) {
        if (this.prev) {
          const abs = this.prev;
          if (abs) {
            return abs.x;
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
      if (this.isType(PathType.horizontalAbs)) {
        this.values[0] = val;
        return;
      } else if (this.isType(PathType.verticalAbs)) {
        this._x = val;
        return;
      }
      if (this.values.length >= 2) {
        this.values[this.values.length - 2] = val;
        this._changedP = true;
      }
    }
  }
  public get y(): number {
    if (this.values) {
      if (this.isType(PathType.verticalAbs)) {
        return this.values[0];
      } else if (
        this.isType(PathType.horizontalAbs) ||
        this.isType(PathType.closeAbs)
      ) {
        if (this.prev) {
          const abs = this.prev;
          if (abs) {
            return abs.y;
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
    if (this.isType(PathType.verticalAbs)) {
      this.values[0] = val;
      return;
    } else if (this.isType(PathType.horizontalAbs)) {
      this._y = val;
      return;
    }
    if (this.values && this.values.length >= 2) {
      this.values[this.values.length - 1] = val;
      this._changedP = true;
    }
  }
  public set p(point: DOMPoint) {
    this.setPointValues(point.x, point.y);
  }
  public get p(): DOMPoint {
    return new DOMPoint(this.x, this.y);
  }
  public setPointValues(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public isRelative(type = this.type) {
    return !this.isAbsolute(type);
  }

  public isAbsolute(type = this.type) {
    return PathDataCommand.isAbsolutePathCommand(type);
  }
  /**
   * get relative command from current absolute.
   */
  public getRelative(): PathDataCommand {
    if (this.isAbsolute()) {
      const relCloned = this.cloneCommand();
      relCloned.type = (relCloned.type || "").toLowerCase();
      const calcRelative = this.calculateRelPoint();
      if (calcRelative) {
        relCloned.p = calcRelative;
      }
      if (relCloned.type !== PathType.arc) {
        const relA = this.calculateRelA();
        if (relA) {
          relCloned.a = relA;
        }
        const relB = this.calculateRelB();
        if (relB) {
          relCloned.b = relB;
        }
      }
      return relCloned;
    }

    return this;
  }

  public isType(...params: (PathType | string)[]): boolean {
    return !!params.find((p) => PathDataCommand.isType(this.type, p));
  }

  /**
   * Check whether handle 'a' is belong to current command or dynamically calculated.
   */
  public get ownA(): boolean {
    if (
      this.isType(PathType.smoothCubicBezierAbs) ||
      this.isType(PathType.smoothQuadraticBezierAbs) ||
      this.isType(PathType.arcAbs) ||
      (this.values && this.values.length < 3)
    ) {
      return false;
    }

    return true;
  }
  /**
   * Check whether handle 'b' is belong to current command or dynamically calculated.
   */
  public get ownB(): boolean {
    if (
      this.isType(PathType.smoothCubicBezierAbs) ||
      this.isType(PathType.arcAbs) ||
      this.values.length >= 6
    ) {
      return true;
    }

    return false;
  }

  public get a(): DOMPoint | null {
    // Calculate virtual
    const prev = this.prev;
    if (
      // S command
      this.type === PathType.smoothCubicBezier ||
      this.type === PathType.smoothCubicBezierAbs
    ) {
      if (!prev) {
        return null;
      }
      /**
       * The start control point is a reflection of the end control point of the previous curve command.
       * If the previous command wasn't a cubic Bézier curve, the start control point
       * is the same as the curve starting point (current point).
       */
      if (
        prev.type === PathType.smoothCubicBezierAbs ||
        prev.type === PathType.cubicBezierAbs
      ) {
        const b = prev.b;
        const x = b?.x || 0;
        const y = b?.y || 0;
        // For this mode handle point is calculated.
        const virtualHandle = new DOMPoint(2 * prev.x - x, 2 * prev.y - y);
        return virtualHandle;
      } else {
        return new DOMPoint(prev.x, prev.y);
      }
    } else if (
      // T command
      this.type === PathType.smoothQuadraticBezier ||
      this.type === PathType.smoothQuadraticBezierAbs
    ) {
      if (
        prev &&
        (prev.type === PathType.smoothQuadraticBezierAbs ||
          prev.type === PathType.quadraticBezierAbs)
      ) {
        // The control point is a reflection of the control point of the previous curve command.
        const a = prev.a;
        const virtualHandle = new DOMPoint(
          2 * prev.x - (a?.x || 0),
          2 * prev.y - (a?.y || 0)
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

  /**
   * get bezier control handle point 'a'.
   */
  public set a(point: DOMPoint | null) {
    // Clean cached point.
    this._a = null;
    if (!point) {
      return;
    }
    const prev = this.prev;

    if (
      // S command
      this.type === PathType.smoothCubicBezierAbs
    ) {
      if (!prev) {
        return;
      }

      if (
        prev.type === PathType.smoothCubicBezierAbs ||
        prev.type === PathType.cubicBezierAbs
      ) {
        // Change handle of the prev node.
        const virtualHandle = new DOMPoint(
          2 * prev.x - point.x,
          2 * prev.y - point.y
        );
        this._changedA = true;
        prev.b = virtualHandle;
      }
      // Virtual point
      return;
    } else if (
      // T command
      this.type === PathType.smoothQuadraticBezierAbs
    ) {
      if (!prev) {
        return;
      }
      if (
        prev.type === PathType.smoothQuadraticBezierAbs ||
        prev.type === PathType.quadraticBezierAbs
      ) {
        const virtualHandle = new DOMPoint(
          2 * prev.x - point.x,
          2 * prev.y - point.y
        );
        this._changedA = true;
        prev.a = virtualHandle;
      }
      // Virtual point
      return;
    }

    if (this.values && this.values.length >= 3) {
      this.values[0] = point.x;
      this.values[1] = point.y;
      this._changedA = true;
      this.cleanCache();
    }
  }
  public get changedA(): boolean {
    // Calculate virtual
    const prev = this.prev;
    if (
      // S command
      this.type === PathType.smoothCubicBezier ||
      this.type === PathType.smoothCubicBezierAbs
    ) {
      /**
       * The start control point is a reflection of the end control point of the previous curve command.
       * If the previous command wasn't a cubic Bézier curve, the start control point
       * is the same as the curve starting point (current point).
       */
      if (
        (prev && prev.type === PathType.smoothCubicBezierAbs) ||
        (prev && prev.type === PathType.cubicBezierAbs)
      ) {
        const b = prev.b;
        return prev.changedB;
      }
    } else if (
      // T command
      this.type === PathType.smoothQuadraticBezier ||
      this.type === PathType.smoothQuadraticBezierAbs
    ) {
      if (
        prev &&
        (prev.type === PathType.smoothQuadraticBezierAbs ||
          prev.type === PathType.quadraticBezierAbs)
      ) {
        return prev.changedA;
      }
    }

    return this._changedA;
  }
  public get changedB(): boolean {
    return this._changedB;
  }
  public get changedP(): boolean {
    return this._changedP;
  }

  /**
   * get bezier control handle point 'b'.
   */
  public get b(): DOMPoint | null {
    if (
      this.type === PathType.arc ||
      this.type === PathType.arcAbs ||
      !this.values
    ) {
      return null;
    }
    // S
    if (this.isType(PathType.smoothCubicBezierAbs)) {
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
  public set b(point: DOMPoint | null) {
    this._b = null;
    if (point) {
      if (
        this.type === PathType.smoothCubicBezier ||
        this.type === PathType.smoothCubicBezierAbs
      ) {
        this.values[0] = point.x;
        this.values[1] = point.y;
        this._changedB = true;
      } else {
        this.values[2] = point.x;
        this.values[3] = point.y;
        this._changedB = true;
      }
    }

    this.cleanCache();
  }

  public get prevPoint(): DOMPoint | null {
    if (!this.prev) {
      return null;
    }
    return new DOMPoint(this.prev.x, this.prev.y);
  }
  /**
   * Arc center
   */
  public get center(): DOMPoint | null {
    const calResults = this.calcEllipse();

    if (!calResults) {
      return null;
    }
    return calResults.center;
  }
  public calcEllipse(): CalculatedEllipse | null {
    if (!this.isType(PathType.arcAbs)) {
      return null;
    }
    if (this.ellipseCache) {
      return this.ellipseCache;
    }
    const prev = this.prevPoint;
    if (!prev) {
      return null;
    }
    this.ellipseCache = Utils.ellipseCenter(
      prev.x,
      prev.y,
      this.rx,
      this.ry,
      this.rotation,
      this.large ? 1 : 0,
      this.sweep ? 1 : 0,
      this.x,
      this.y
    );
    return this.ellipseCache;
  }
  /**
   * Convert arc to bezier cubic curves.
   */
  public arcApproxCurves(): number[][] | null {
    if (!this.isType(PathType.arcAbs)) {
      return null;
    }
    if (this.approxCurves) {
      return this.approxCurves;
    }
    const prev = this.prevPoint;
    if (!prev) {
      return null;
    }
    this.approxCurves = arcToCubicCurves(
      prev.x,
      prev.y,
      this.rx,
      this.ry,
      this.rotation,
      this.large ? 1 : 0,
      this.sweep ? 1 : 0,
      this.x,
      this.y
    );
    return this.approxCurves;
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
  /**
   * Whether control point is a calculated and just a reflection of one of the prev command.
   * This can happens for smooth bezier commands.
   */
  public isCalculatedA(): boolean {
    this._a = null;
    if (
      // S command
      this.type === PathType.smoothCubicBezier ||
      this.type === PathType.smoothCubicBezierAbs
    ) {
      // Virtual point
      return true;
    } else if (
      // T command
      this.type === PathType.smoothQuadraticBezier ||
      this.type === PathType.smoothQuadraticBezierAbs
    ) {
      // Virtual point
      return true;
    }

    return false;
  }
  public getPointOnPath(fractionLength: number): DOMPoint | null {
    const toReturn = this.pointsCache.get(fractionLength);
    if (toReturn) {
      return toReturn;
    }
    let maxLength = this.length;
    if (maxLength === null) {
      maxLength = PointOnPathUtils.getSegmentLength(this);
    }
    const point = PointOnPathUtils.getPointOnPath(
      this,
      fractionLength,
      maxLength
    );
    // Cache only first and last commonly used points.
    if (point && fractionLength < 1 && fractionLength > this.length - 1) {
      this.pointsCache.set(fractionLength, point);
    }
    return point;
  }
  public getRel(x: number | null, y: number | null): DOMPoint | null {
    if (x === null || y === null) {
      return null;
    }
    if (this.prev) {
      const prev = this.prev;
      if (prev) {
        const point = prev.p;
        if (point) {
          x = x - point.x;
          y = y - point.y;
        }
      }
    }
    return new DOMPoint(x, y);
  }

  public calculateRelative() {}

  public calculateRelPoint(): DOMPoint | null {
    return this.getRel(this.x, this.y);
  }
  public calculateRelA(): DOMPoint | null {
    const abs = this;
    const a = abs.a;
    return this.getRel(a ? a.x : null, a ? a.y : null);
  }
  public calculateRelB(): DOMPoint | null {
    const b = this.b;
    return this.getRel(b ? b.x : null, b ? b.y : null);
  }
  /** Arc radius point. */
  public get rx(): number {
    if (!this.isArc()) {
      return 0;
    }

    return this.values[0];
  }

  public set rx(value: number) {
    if (!this.isArc()) {
      return;
    }
    this.values[0] = value;
    this.cleanCache();
  }
  public get ry(): number {
    if (!this.isArc()) {
      return 0;
    }

    return this.values[1];
  }
  public set ry(value: number) {
    if (!this.isArc()) {
      return;
    }
    this.values[1] = value;
    this.cleanCache();
  }

  public isArc() {
    return this.type === PathType.arcAbs || this.type === PathType.arc;
  }
  /**
   * Wrong Arc radius can be set within the path data command.
   * (small distance between path segments).
   * This method will calculate real radius for the ellipse.
   */
  public getCalculatedRadius(): DOMPoint | null {
    if (!this.isArc()) {
      return null;
    }
    const calResults = this.calcEllipse();

    if (!calResults) {
      return new DOMPoint(this.rx, this.ry);
    }
    return new DOMPoint(calResults.rx, calResults.ry);
  }
  /**
   * the x-axis of the ellipse is rotated by x-axis-rotation
   * degrees relative to the x-axis of the current coordinate system.
   */
  public get rotation(): number {
    if (!this.isArc()) {
      return 0;
    }
    return this.values[2];
  }

  public set rotation(val: number) {
    if (!this.isArc()) {
      return;
    }
    this.values[2] = val;
    this.cleanCache();
  }
  public get large(): boolean {
    if (!this.isArc()) {
      return false;
    }
    return this.values[3] === 1;
  }
  public set large(val: boolean) {
    if (!this.isArc()) {
      return;
    }
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
    if (!this.isArc()) {
      return false;
    }
    return this.values[4] === 1;
  }
  public set sweep(val: boolean) {
    if (!this.isArc()) {
      return;
    }
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
   * Reset changed flags.
   */
  public markAsUnchanged() {
    this._changedA = false;
    this._changedB = false;
    this._changedP = false;
  }
  /**
   * Get path data command bounds.
   */
  public getBounds(): DOMRect | null {
    if (this.type === PathType.moveAbs) {
      return null;
    }
    const prev = this.prevPoint;
    if (!prev) {
      return null;
    }
    const p = this.p;
    const a = this.a;
    const b = this.b;

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
    if (this.type === PathType.arcAbs) {
      // TODO: calculate bounding box of arc
      const r = this.getCalculatedRadius();
      const centerArc = this.center;
      if (!r || !centerArc) {
        return null;
      }
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
    // TODO: implement for the optimization
    return null;
  }
  /**
   * Cleanup cached calculations.
   */
  private cleanCache() {
    this.ellipseCache = null;
    this.approxCurves = null;
    this._length = null;
    this.pointsCache.clear();
  }
}
