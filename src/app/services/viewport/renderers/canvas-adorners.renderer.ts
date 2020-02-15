import { Injectable, NgZone } from "@angular/core";
import { ViewportService } from "./../viewport.service";
import { LoggerService } from "../../logger.service";
import { consts } from "src/environments/consts";
import { RulerRenderer } from "./ruler.renderer";

@Injectable({
  providedIn: "root"
})
/**
 * Service to control the order of the canvas adorners renderings services.
 */
export class CanvasAdornersRenderer {
  rulerHElement: HTMLCanvasElement = null;
  rulerWElement: HTMLCanvasElement = null;
  canvasElement: HTMLCanvasElement = null;
  ctx: CanvasRenderingContext2D = null;
  rulerWCTX: CanvasRenderingContext2D = null;
  rulerHCTX: CanvasRenderingContext2D = null;

  private showGridLines = true;
  constructor(
    protected viewportService: ViewportService,
    protected logger: LoggerService,
    private ngZone: NgZone,
    private rulerRenderer: RulerRenderer
  ) {
    this.viewportService.viewportTransformationSubject
      .asObservable()
      .subscribe(() => {
        this.update();
      });

    this.viewportService.viewportResize.subscribe(() => {
      this.update();
    });
  }

  init(
    canvasElement: HTMLCanvasElement,
    rulerHElement: HTMLCanvasElement,
    rulerWElement: HTMLCanvasElement
  ) {
    this.rulerHElement = rulerHElement;
    this.rulerWElement = rulerWElement;
    this.canvasElement = canvasElement;
    this.update();
  }

  setShowGridLines(){

  }

  update() {
    this.rescale();

    if (this.ctx) {
      this.redraw();
    }
  }

  isInit() {
    return !!this.ctx;
  }

  initCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    if (!canvas) {
      return null;
    }
    if (!ctx && canvas) {
      ctx = canvas.getContext("2d");
      // ctx.translate(0.5, 0.5);
    }

    const ratio = window.devicePixelRatio;
    const width = canvas.clientWidth * ratio;
    const height = canvas.clientHeight * ratio;
    if (width !== ctx.canvas.width) {
      ctx.canvas.width = width;
    }

    if (height !== ctx.canvas.height) {
      ctx.canvas.height = height;
    }

    return ctx;
  }

  rescale() {
    if (!this.canvasElement) {
      return;
    }

    this.ctx = this.initCanvas(this.canvasElement, this.ctx);
    this.rulerWCTX = this.initCanvas(this.rulerWElement, this.rulerWCTX);
    this.rulerHCTX = this.initCanvas(this.rulerHElement, this.rulerHCTX);
  }

  redraw() {
    this.ngZone.runOutsideAngular(() => {
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(() => {
          this.redrawInternal();
        });
      } else {
        this.redrawInternal();
      }
    });
  }

  redrawInternal() {
    this.ctx = this.initCanvas(this.canvasElement, this.ctx);
    this.rulerWCTX = this.initCanvas(this.rulerWElement, this.rulerWCTX);
    this.rulerHCTX = this.initCanvas(this.rulerHElement, this.rulerHCTX);
    this.rulerRenderer.redraw(this.ctx, this.rulerWCTX, this.rulerHCTX, this.showGridLines);
  }
}
