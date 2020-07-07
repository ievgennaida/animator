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

  public offset(x: number, y: number, offsetHandles = true) {
    this.values[0] += x;
  }
  public get p(): DOMPoint {
    return new DOMPoint(this.values[0], 0);
  }
  public set p(point: DOMPoint) {
    this.setPointValues(point.x, point.y);
  }
  public setPointValues(x: number, y: number) {
    this.values[0] = x;
  }
}
