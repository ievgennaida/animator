import { PathDataCommand } from './path-data-command';

export class APathDataCommand extends PathDataCommand {
    constructor(public type: string, public values: number[] = []) {
      super(type, values);
    }
    public center: DOMPoint;
    public r: DOMPoint;
    /**
     * the x-axis of the ellipse is rotated by x-axis-rotation
     * degrees relative to the x-axis of the current coordinate system.
     */
    public rotation: number;
    public large: number;
    /**
     * If sweep-flag is '1', then the arc will be drawn in a "positive-angle"
     * direction (i.e., the ellipse formula x=cx+rx*cos(theta) and y=cy+ry*sin(theta)
     * is evaluated such that theta starts at an angle corresponding to the current point
     * and increases positively until the arc reaches
     */
    public sweep: number;
    update() {
      if (!this.r) {
        this.r = new DOMPoint();
      }
      this.r.x = this.values[0];
      this.r.y = this.values[1];
      this.rotation = this.values[2];
      this.large = this.values[3];
      this.sweep = this.values[4];
    }
  }