import { BehaviorSubject } from "rxjs";
import { TreeNode } from "src/app/models/tree-node";
import { Adorner } from "../../models/adorner";

export class BaseRenderer {
  canvasCTM: DOMMatrix = new DOMMatrix();
  /**
   * Renderer canvas viewport CTM.
   */
  screenCTM: DOMMatrix = new DOMMatrix();
  ctx: CanvasRenderingContext2D | null = null;
  devicePixelRatio = window.devicePixelRatio;
  // TODO: use one pixel for different devices to draw lines sharp
  onePixel = this.devicePixelRatio;
  suspendedSubject = new BehaviorSubject<boolean>(false);
  get suspended() {
    return this.suspendedSubject.getValue();
  }

  /**
   * Set suspended and rise event.
   */
  set suspended(value: boolean) {
    if (this.suspended !== value) {
      this.suspendedSubject.next(value);
    }
  }
  invalidated = false;

  /**
   * Force suspend renderers and render once when some 'heavy' command executed that can call render multiple times.
   *
   * @param callback execute command.
   * @param params list of renderers to update after the command executed.
   */
  public static invalidateOnceAfter(
    callback: () => void,
    ...params: BaseRenderer[]
  ) {
    const suspendedStates = params.map((p) => {
      const wasSuspended = p.suspended;
      p.suspend();
      return wasSuspended;
    });
    try {
      // Callback might call invalidate again.
      // We can suspend services before and resume after the call.
      if (callback) {
        callback();
      }
    } finally {
      params.forEach((p, index) => {
        p.invalidate();
        // Check whether was initially suspended
        if (!suspendedStates[index]) {
          p.resume();
        }
      });
    }
  }
  public setCanvas(canvas: HTMLCanvasElement): void {
    this.ctx = this.initContext(canvas);
    this.invalidateSizeChanged();
  }

  public initContext(
    canvas: HTMLCanvasElement | null
  ): CanvasRenderingContext2D | null {
    if (!canvas) {
      return null;
    }
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    return ctx;
  }

  public invalidateSizeChanged(): void {
    if (!this.ctx) {
      return;
    }
    const changed = this.rescaleCanvas(this.ctx);
    if (changed) {
      this.invalidate();
    }
  }

  public suspend(clean = false): void {
    if (!this.suspended) {
      this.suspended = true;
      if (clean) {
        this.clear();
      }
    }
  }

  public clear(): void {
    if (this.ctx) {
      this.clearBackground(this.ctx);
    }
  }

  public resume(): void {
    this.suspended = false;
  }

  public invalidate(): void {
    this.invalidated = true;
  }

  public redrawRequired(): boolean {
    // TODO: check canvas size

    return this.invalidated && !this.suspended;
  }

  /**
   * Run operation in suspended mode and than resume original state.
   * Operation can be used to run multiple update renderer operation and update once.
   *
   * @param callback action to execute.
   * @param invalidate whether invalidation is required.
   */
  runSuspended(callback: () => void, invalidate = true): void {
    const wasSuspended = this.suspended;
    this.suspend();
    try {
      // Callback might call invalidate again.
      // We can suspend services before and resume after the call.
      if (callback) {
        callback();
      }
    } finally {
      if (invalidate) {
        this.invalidate();
      }
      // Check whether was initially suspended
      if (!wasSuspended) {
        this.resume();
      }
    }
  }
  rescaleCanvas(ctx: CanvasRenderingContext2D | null): boolean {
    let changed = false;
    if (!ctx || !ctx.canvas) {
      return false;
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

  public redraw(): void {
    if (!this.ctx) {
      return;
    }

    this.invalidated = false;
  }

  drawLine(
    ctx: CanvasRenderingContext2D | null,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): void {
    if (ctx) {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
  }

  clearBackground(ctx: CanvasRenderingContext2D | null): void {
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }

  drawPathOutline(
    node: TreeNode,
    stroke: string,
    thickness: number = 0
  ): boolean {
    if ((!node && Path2D) || !stroke || thickness === 0 || !this.ctx) {
      return false;
    }
    const data = node.getPathData();

    if (data && data.commands) {
      const stringPath = data.toString();
      if (!stringPath) {
        return false;
      }
      const path2d = new Path2D();
      if (!path2d.addPath) {
        // Check whether method is supported.
        return false;
      }
      const matrix = node.getScreenCTM();
      if (matrix) {
        path2d.addPath(new Path2D(stringPath), this.screenCTM.multiply(matrix));
      }
      this.ctx.lineWidth = thickness;
      this.ctx.strokeStyle = stroke;
      this.ctx.stroke(path2d);
      return true;
    }

    return false;
  }
  getSharpPos(point: DOMPoint, thickness = 1): DOMPoint {
    point.x = this.getSharp(point.x, thickness);
    point.y = this.getSharp(point.y, thickness);
    return point;
  }

  getSharp(pos: number, thickness = this.devicePixelRatio): number {
    const offset = this.onePixel / 2;
    pos = Math.floor(pos) + offset;
    return pos;
  }

  drawRect(
    ctx: CanvasRenderingContext2D,
    rect: DOMRect | null,
    thickness: number = 1,
    stroke: string = "black",
    fillStyle: string | null = null
  ): void {
    if (!rect) {
      return;
    }
    this.drawPath(
      ctx,
      thickness,
      stroke,
      fillStyle,
      true,
      new DOMPoint(rect.x, rect.y),
      new DOMPoint(rect.x + rect.width, rect.y),
      new DOMPoint(rect.x + rect.width, rect.y + rect.height),
      new DOMPoint(rect.x, rect.y + rect.height)
    );
  }
  drawPath(
    ctx: CanvasRenderingContext2D | null,
    thickness: number,
    stroke: string | null,
    fillStyle: string | null,
    closed: boolean,
    ...points: Array<DOMPoint | null>
  ): void {
    if (!ctx || !points || points.length === 0) {
      return;
    }
    ctx.beginPath();

    points.forEach((point, index) => {
      if (!point) {
        return;
      }
      const p = this.getSharpPos(point, thickness);
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
    ctx: CanvasRenderingContext2D | null,
    p: DOMPoint,
    centerSize = 5,
    stroke: string = "black",
    thickness: number = 1
  ) {
    if (!ctx) {
      return;
    }
    ctx.beginPath();
    ctx.lineWidth = thickness;
    ctx.strokeStyle = stroke;
    p = this.getSharpPos(p);
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
    adorner: Adorner | null
  ) {
    if (!adorner) {
      return;
    }

    this.drawPath(
      ctx,
      thickness,
      stroke,
      null,
      true,
      adorner.topLeft,
      adorner.topRight,
      adorner.bottomRight,
      adorner.bottomLeft
    );
  }
}
