import { BehaviorSubject } from "rxjs";
import { TreeNode } from "src/app/models/tree-node";
import { Adorner } from "../adorners/adorner";

export class BaseRenderer {
  canvasCTM: DOMMatrix = new DOMMatrix();
  /**
   * Renderer canvas viewport CTM.
   */
  screenCTM: DOMMatrix = new DOMMatrix();
  ctx: CanvasRenderingContext2D = null;
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
  public static runSuspendedRenderers(
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

  /**
   * Run operation in suspended mode and than resume original state.
   * Operation can be used to run multiple update renderer operation and update once.
   * @param callback action to execute.
   * @param invalidate whether invalidation is required.
   */
  runSuspended(callback: () => void, invalidate = true) {
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

  drawPathOutline(
    node: TreeNode,
    stroke: string,
    thickness: number = 0
  ): boolean {
    if ((!node && Path2D) || !stroke || thickness === 0) {
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
      path2d.addPath(
        new Path2D(stringPath),
        this.screenCTM.multiply(node.getScreenCTM())
      );
      this.ctx.lineWidth = thickness;
      this.ctx.strokeStyle = stroke;
      this.ctx.stroke(path2d);
      return true;
    }

    return false;
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

  drawRect(
    ctx: CanvasRenderingContext2D,
    rect: DOMRect,
    thickness: number = 1,
    stroke: string = "black",
    fillStyle: string = null
  ) {
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
      const p = this.getSharpPos(point, thickness);
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
    centerSize = 5,
    stroke: string = "black",
    thickness: number = 1
  ) {
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
    adorner: Adorner
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
