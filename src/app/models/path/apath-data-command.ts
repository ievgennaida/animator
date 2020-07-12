import { PathDataCommand } from "./path-data-command";
import { Utils } from "src/app/services/utils/utils";

export class APathDataCommand extends PathDataCommand {
  constructor(public type: string, public values: number[] = []) {
    super(type, values);
  }
  public get x(): number {
    return super.x;
  }
  public set x(val: number) {
    super.x = val;
    this._center = null;
  }
  public get y(): number {
    return super.y;
  }
  public set y(val: number) {
    super.y = val;
    this._center = null;
  }
  // tslint:disable-next-line: variable-name
  private _center: DOMPoint | null = null;
  public get center(): DOMPoint {
    if (this._center) {
      return this._center;
    }
    const c = this.getAbsolute() as APathDataCommand;
    const abs = this.prev.getAbsolute().p;
    this._center = Utils.ellipseCenter(
      abs.x,
      abs.y,
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
  // tslint:disable-next-line: variable-name
  private _r: DOMPoint;
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
    this._center = null;
    this.values[0] = point.x;
    this.values[1] = point.y;
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
  public get sweep(): number {
    return this.values[4];
  }
  public set sweep(val: number) {
    this.values[4] = val;
    this._center = null;
  }
}
