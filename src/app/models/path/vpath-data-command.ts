import { PathDataCommand } from "./path-data-command";

/**
 * Draws a vertical line from the current point.
 */
export class VPathDataCommand extends PathDataCommand {
  public get y(): number {
    return this.values[0];
  }
  public set y(val: number) {
    this.values[0] = val;
  }

  // tslint:disable-next-line: variable-name
  private _x = 0;
  public get x(): number {
    return this._x;
  }
  public set x(val: number) {
    this._x = val;
  }
}
