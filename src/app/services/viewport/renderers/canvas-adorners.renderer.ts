import { Injectable, NgZone } from "@angular/core";
import { LoggerService } from "../../logger.service";
import { consts } from "src/environments/consts";
import { BoundsRenderer } from "./bounds.renderer";
import { BaseRenderer } from "./base.renderer";
import { BehaviorSubject } from "rxjs";
import { OutlineService } from "../../outline.service";
import { TransformsService } from "../transformations/transforms.service";
import { ViewService } from "../../view.service";
import { GridLinesRenderer } from "./grid-lines.renderer";
import { SelectorRenderer } from "./selector.renderer";

@Injectable({
  providedIn: "root",
})
/**
 * Service to control the order of the canvas adorners renderers.
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
    private selectorRenderer: SelectorRenderer,
    private transformsService: TransformsService,
    private viewService: ViewService,
    protected logger: LoggerService,
    private ngZone: NgZone,
    private gridLinesRenderer: GridLinesRenderer,
    protected outlineService: OutlineService
  ) {
    super();
    this.outlineService.mouseOver.subscribe(() => {
      this.adornersInvalidate();
    });

    this.outlineService.selected.subscribe(() => {
      this.adornersInvalidate();
    });

    // Individual element is transformed.
    this.transformsService.transformed.subscribe(() => {
      this.boundsRenderer.invalidate();
    });

    // view is transformed
    this.viewService.transformed.subscribe(() => {
      this.invalidate();
    });

    this.viewService.viewportResize.subscribe(() => {
      this.invalidate();
    });

    this.startDrawLoop();
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
    this.canvasCTM.a = this.onePixel;
    this.canvasCTM.d = this.onePixel;
    this.ctx = this.initCanvas(this.canvasElement, this.ctx);
    this.rescaleCanvas(this.canvasElement, this.ctx);

    this.gridCTX = this.initCanvas(this.gridElement, this.gridCTX);
    this.rulerWCTX = this.initCanvas(this.rulerWElement, this.rulerWCTX);
    this.rulerHCTX = this.initCanvas(this.rulerHElement, this.rulerHCTX);
    let changed = this.rescaleCanvas(this.gridElement, this.gridCTX);
    redrawGrid = redrawGrid || changed;
    changed = this.rescaleCanvas(this.rulerWElement, this.rulerWCTX);
    redrawGrid = redrawGrid || changed;
    changed = this.rescaleCanvas(this.rulerHElement, this.rulerHCTX);
    redrawGrid = redrawGrid || changed;
    if (redrawGrid) {
      this.gridLinesRenderer.invalidate();
    }

    this.boundsRenderer.invalidate();
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

  startDrawLoop() {
    this.ngZone.runOutsideAngular(() => {
      const draw = () => {
        this.redraw();
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(draw);
        }
      };

      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(draw);
      } else {
        setInterval(draw, 100);
      }
    });
  }

  private redraw() {
    // Ordered list to redraw:
    if (this.gridCTX) {
      if (this.gridLinesRenderer.redrawRequired()) {
        this.gridLinesRenderer.redraw(
          this.gridCTX,
          this.rulerWCTX,
          this.rulerHCTX,
          this.showGridLinesSubject.getValue()
        );
      }
    }
    this.boundsRenderer.canvasCTM = this.canvasCTM;
    if (this.ctx) {
      if (this.boundsRenderer.redrawRequired()) {
        this.boundsRenderer.redraw(this.ctx);
      }
    }

    if (this.selectorRenderer.redrawRequired()) {
      this.selectorRenderer.redraw();
    }
  }
}
