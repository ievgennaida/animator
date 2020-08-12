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
    this.invalidateSizeChanged();
  }

  public initContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    if (!canvas) {
      return null;
    }
    const ctx = canvas.getContext("2d");
    return ctx;
  }

  public invalidateSizeChanged() {
    const changed = this.rescaleCanvas(this.ctx);
    if (changed) {
      this.invalidate();
    }
  }

  public suspend(clean = false) {
    if (!this.suspended) {
      this.suspended = true;
      if (clean) {
        this.clear();
      }
    }
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
    // TODO: check canvas size

    return this.invalidated && !this.suspended;
  }

  rescaleCanvas(ctx: CanvasRenderingContext2D): boolean {
    let changed = false;
    if (!ctx || !ctx.canvas) {
      return null;
    }
    // TODO: this method should not do any complex transforms
    const canvas = ctx.canvas;
    const newX = Math.floor(canvas.clientWidth);

    if (newX !== ctx.canvas.width) {
      ctx.canvas.width = newX;
      changed = true;
    }

    const newY = Math.floor(canvas.clientHeight);
    if (newY !== ctx.canvas.height) {
      ctx.canvas.height = newY;
      changed = true;
    }

    return changed;
  }

  public redraw() {
    if (!this.ctx) {
      return;
    }

    this.invalidated = false;
  }

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
  getSharpPos(point: DOMPoint, thickness = 1) {
    point.x = this.getSharp(point.x, thickness);
    point.y = this.getSharp(point.y, thickness);
    return point;
  }

  getSharp(pos: number, thickness = this.devicePixelRatio): number {
    const offset = this.onePixel / 2;
    pos = Math.floor(pos) + offset;
    return pos;
  }

  drawPath(
    ctx: CanvasRenderingContext2D,
    thickness: number,
    stroke: string,
    fillStyle: string,
    closed: boolean,
    ...points: Array<DOMPoint>
  ) {
    if (!ctx || !points || points.length === 0) {
      return;
    }
    ctx.beginPath();

    points.forEach((point, index) => {
      const p = point;
      if (!p) {
        return;
      }
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

    if (thickness) {
      ctx.lineWidth = thickness;
    }

    if (stroke && thickness) {
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
    thickness: number,
    stroke: string,
    adornerData: AdornerData
  ) {
    this.drawPath(
      ctx,
      thickness,
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
