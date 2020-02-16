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
  ctx: CanvasRenderingContext2D = null;
  rulerWCTX: CanvasRenderingContext2D = null;
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
    rulerHElement: HTMLCanvasElement,
    rulerWElement: HTMLCanvasElement
  ) {
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
    this.invalidate();
  }

  invalidate() {
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
      // ctx.translate(this.devicePixelRatio/2, 0.5);
    }

    // TODO: skip before creating an object.
    const point = this.canvasCTM.transformPoint(
      new DOMPoint(canvas.clientWidth, canvas.clientHeight)
    );

    if (Math.round(point.x) !== ctx.canvas.width) {
      ctx.canvas.width = point.x;
    }

    if (Math.round(point.y) !== ctx.canvas.height) {
      ctx.canvas.height = point.y;
    }

    return ctx;
  }

  rescale() {
    if (!this.canvasElement) {
      return;
    }
    // set zoom
    this.canvasCTM.a = this.onePixel;
    this.canvasCTM.d = this.onePixel;
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
    this.rulerRenderer.redraw(
      this.ctx,
      this.rulerWCTX,
      this.rulerHCTX,
      this.showGridLinesSubject.getValue()
    );
    this.boundsRenderer.canvasCTM = this.canvasCTM;
    // TODO: this renderer can be displated on the separate canvas for the performance.
    this.boundsRenderer.redraw(this.ctx);
  }
}
