import { AdornerData } from "../adorners/adorner-data";
import { consts } from "src/environments/consts";

export class BaseRenderer {
  canvasCTM: DOMMatrix = new DOMMatrix();
  screenCTM: DOMMatrix = new DOMMatrix();
  ctx: CanvasRenderingContext2D = null;
  devicePixelRatio = window.devicePixelRatio;
  // TODO: use one pixel for different devices to draw lines sharp
  onePixel = this.devicePixelRatio;
  suspended = false;
  invalidated = false;
  public setCanvas(canvas: HTMLCanvasElement) {
    this.ctx = this.initContext(canvas);
    this.onViewportSizeChanged();
  }

  public initContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext("2d");
    return ctx;
  }

  public onViewportSizeChanged() {
    const changed = this.rescaleCanvas(this.ctx);
    if (changed) {
      this.invalidate();
    }
  }

  public suspend() {
    this.suspended = true;
  }

  public clear() {
    if (this.ctx) {
      this.clearBackground(this.ctx);
    }
  }

  public resume() {
    this.suspended = false;
  }

  public invalidate() {
    this.invalidated = true;
  }

  public redrawRequired() {
    return this.invalidated && !this.suspended;
  }

  rescaleCanvas(ctx: CanvasRenderingContext2D): boolean {
    let changed = false;
    if (!ctx || !ctx.canvas) {
      return null;
    }
    const canvas = ctx.canvas;
    // TODO: skip before creating an object.
    const point = this.canvasCTM.transformPoint(
      new DOMPoint(canvas.clientWidth, canvas.clientHeight)
    );

    const newX = Math.floor(point.x);

    if (newX !== ctx.canvas.width) {
      ctx.canvas.width = newX;
      changed = true;
    }

    const newY = Math.floor(point.y);
    if (newY !== ctx.canvas.height) {
      ctx.canvas.height = newY;
      changed = true;
    }

    return changed;
  }

  public redraw() {}

  drawLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }

  clearBackground(ctx: CanvasRenderingContext2D) {
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }

  getDistance(x1: number, y1: number, x2?: number, y2?: number) {
    if (x2 !== undefined && y2 !== undefined) {
      return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    } else {
      return Math.abs(x1 - y1);
    }
  }
  getSharpPos(point: DOMPoint, thinkess = 1) {
    point.x = this.getSharp(point.x, thinkess);
    point.y = this.getSharp(point.y, thinkess);
    return point;
  }

  getSharp(pos: number, thinkess = this.devicePixelRatio): number {
    const offset = this.onePixel / 2;
    pos = Math.floor(pos) + offset;
    return pos;
  }

  drawPath(
    ctx: CanvasRenderingContext2D,
    thikness: number,
    stroke: string,
    fillStyle: string,
    closed: boolean,
    ...points: Array<DOMPoint>
  ) {
    ctx.beginPath();

    points.forEach((point, index) => {
      const p = point;
      // const p = this.getSharpPos(point);
      if (index === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        ctx.lineTo(p.x, p.y);
      }
    });

    if (closed) {
      ctx.closePath();
    }

    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }

    if (thikness) {
      ctx.lineWidth = thikness;
    }

    if (stroke && thikness) {
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  drawCross(
    ctx: CanvasRenderingContext2D,
    p: DOMPoint,
    stroke: string = "black"
  ) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = stroke;
    p = this.getSharpPos(p);
    const centerSize = 5;
    ctx.moveTo(p.x - centerSize, p.y);
    ctx.lineTo(p.x + centerSize, p.y);
    ctx.moveTo(p.x, p.y - centerSize);
    ctx.lineTo(p.x, p.y + centerSize);
    ctx.stroke();
    ctx.closePath();
  }

  drawAdornerRect(
    ctx: CanvasRenderingContext2D,
    thikness: number,
    stroke: string,
    adornerData: AdornerData
  ) {
    this.drawPath(
      ctx,
      thikness,
      stroke,
      null,
      true,
      adornerData.topLeft,
      adornerData.topRight,
      adornerData.bottomRight,
      adornerData.bottomLeft
    );
  }
}
