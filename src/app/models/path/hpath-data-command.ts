import { PathDataCommand } from "./path-data-command";

/**
 * Draws a horizontal line from the current point.
 */
export class HPathDataCommand extends PathDataCommand {
  public get x(): number {
    return this.values[0];
  }
  public set x(val: number) {
    this.values[0] = val;
  }
  // tslint:disable-next-line: variable-name
  private _y = 0;
  public get y(): number {
    return this._y;
  }
  public set y(val: number) {
    this._y = val;
  }
}
