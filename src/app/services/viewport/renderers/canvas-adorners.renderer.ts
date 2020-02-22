import { Injectable, NgZone } from "@angular/core";
import { ViewportService } from "./../viewport.service";
import { LoggerService } from "../../logger.service";
import { consts } from "src/environments/consts";
import { RulerRenderer } from "./ruler.renderer";
import { BoundsRenderer } from "./bounds.renderer";
import { BaseRenderer } from "./base.renderer";
import { BehaviorSubject } from "rxjs";
import { OutlineService } from "../../outline.service";

@Injectable({
  providedIn: "root"
})
/**
 * Service to control the order of the canvas adorners renderings services.
 */
export class CanvasAdornersRenderer extends BaseRenderer {
  rulerHElement: HTMLCanvasElement = null;
  rulerWElement: HTMLCanvasElement = null;
  canvasElement: HTMLCanvasElement = null;
  gridElement: HTMLCanvasElement = null;
  ctx: CanvasRenderingContext2D = null;
  rulerWCTX: CanvasRenderingContext2D = null;
  gridCTX: CanvasRenderingContext2D = null;
  rulerHCTX: CanvasRenderingContext2D = null;
  showGridLinesSubject = new BehaviorSubject<boolean>(consts.showGridLines);

  constructor(
    private boundsRenderer: BoundsRenderer,
    private viewportService: ViewportService,
    protected logger: LoggerService,
    private ngZone: NgZone,
    private rulerRenderer: RulerRenderer,
    protected outlineService: OutlineService
  ) {
    super();
    this.outlineService.mouseOver.subscribe(() => {
      this.adornersInvalidate();
    });

    this.outlineService.selected.subscribe(() => {
      this.adornersInvalidate();
    });

    this.viewportService.viewportTransformationSubject
      .asObservable()
      .subscribe(() => {
        this.invalidate();
      });

    this.viewportService.viewportResize.subscribe(() => {
      this.invalidate();
    });
  }

  init(
    canvasElement: HTMLCanvasElement,
    gridElement: HTMLCanvasElement,
    rulerHElement: HTMLCanvasElement,
    rulerWElement: HTMLCanvasElement
  ) {
    this.gridElement = gridElement;
    this.rulerHElement = rulerHElement;
    this.rulerWElement = rulerWElement;
    this.canvasElement = canvasElement;
    this.invalidate();
  }

  toogleShowGridLines() {
    this.showGridLinesSubject.next(!this.showGridLinesSubject.getValue());
    this.invalidate();
  }

  adornersInvalidate() {
    // Same call but can be handled separatelly for the performance.
    this.invalidate(false);
  }

  invalidate(redrawGrid: boolean = true) {
    // TODO: list! implement dynamic leyers
    this.canvasCTM.a = this.onePixel;
    this.canvasCTM.d = this.onePixel;
    this.ctx = this.initCanvas(this.canvasElement, this.ctx);
    this.rescaleCanvas(this.gridElement, this.ctx);

    this.gridCTX = this.initCanvas(this.gridElement, this.gridCTX);
    this.rulerWCTX = this.initCanvas(this.rulerWElement, this.rulerWCTX);
    this.rulerHCTX = this.initCanvas(this.rulerHElement, this.rulerHCTX);
    let changed = this.rescaleCanvas(this.gridElement, this.gridCTX);
    redrawGrid = redrawGrid || changed;
    changed = this.rescaleCanvas(this.rulerWElement, this.rulerWCTX);
    redrawGrid = redrawGrid || changed;
    changed = this.rescaleCanvas(this.rulerHElement, this.rulerHCTX);
    redrawGrid = redrawGrid || changed;

    this.redraw(redrawGrid);
  }

  initCanvas(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ): CanvasRenderingContext2D {
    if (!canvas) {
      return null;
    }
    if (!ctx && canvas) {
      ctx = canvas.getContext("2d");
      // ctx.translate(this.devicePixelRatio/2, 0.5);
    }

    return ctx;
  }

  rescaleCanvas(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ): boolean {
    let changed = false;
    if (!canvas) {
      return null;
    }

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

  redraw(redrawGrid: boolean = true) {
    this.ngZone.runOutsideAngular(() => {
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(() => {
          this.redrawInternal(redrawGrid);
        });
      } else {
        this.redrawInternal(redrawGrid);
      }
    });
  }

  redrawInternal(redrawGrid: boolean = true) {
    if (redrawGrid && this.gridCTX) {
      this.rulerRenderer.redraw(
        this.gridCTX,
        this.rulerWCTX,
        this.rulerHCTX,
        this.showGridLinesSubject.getValue()
      );
    }
    this.boundsRenderer.canvasCTM = this.canvasCTM;
    if (this.ctx) {
      // TODO: this renderer can be displated on the separate canvas for the performance.
      this.boundsRenderer.redraw(this.ctx);
    }
  }
}
