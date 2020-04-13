import { PathDataCommand } from "./path-data-command";

/**
 * S shorthand/smooth curveto (x2 y2 x y)+
 */
export class SPathDataCommand extends PathDataCommand {
  public a: DOMPoint;
  update() {
    if (!this.a) {
      this.a = new DOMPoint();
    }
    this.a.x = this.values[0];
    this.a.y = this.values[1];
  }
}
