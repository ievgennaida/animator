import { Injectable, NgZone } from "@angular/core";
import { LoggerService } from "../logger.service";
import { ViewService } from "../view.service";
import { BaseRenderer } from "./base.renderer";
import { BoundsRenderer } from "./bounds.renderer";
import { GridLinesRenderer } from "./grid-lines.renderer";
import { MouseOverRenderer } from "./mouse-over.renderer";
import { PathRenderer } from "./path.renderer";
import { SelectorRenderer } from "./selector.renderer";

@Injectable({
  providedIn: "root",
})
/**
 * Service to control the order of the canvas adorners renderers.
 */
export class AdornersRenderer extends BaseRenderer {
  renderers: Array<BaseRenderer> = [];
  constructor(
    boundsRenderer: BoundsRenderer,
    selectorRenderer: SelectorRenderer,
    mouseOverRenderer: MouseOverRenderer,
    gridLinesRenderer: GridLinesRenderer,
    pathRenderer: PathRenderer,
    private viewService: ViewService,
    protected logger: LoggerService,
    private ngZone: NgZone
  ) {
    super();
    this.renderers.push(gridLinesRenderer);
    this.renderers.push(boundsRenderer);
    this.renderers.push(pathRenderer);
    this.renderers.push(mouseOverRenderer);
    this.renderers.push(selectorRenderer);
    this.startDrawLoop();
  }

  startDrawLoop(): void {
    this.ngZone.runOutsideAngular(() => {
      const draw = () => {
        try {
          this.redraw();
        } finally {
          if (window.requestAnimationFrame) {
            window.requestAnimationFrame(draw);
          } else {
            setTimeout(draw, 100);
          }
        }
      };

      draw();
    });
  }

  invalidateSizeChanged(): void {
    if (!this.viewService.viewport) {
      return;
    }

    const parent = this.viewService.svgRoot();
    const ctm = parent?.getScreenCTM()?.inverse();
    if (!ctm) {
      return;
    }
    // Get renderers viewport screen CTM:
    this.screenCTM = this.canvasCTM.multiply(ctm);
    this.renderers.forEach((renderer) => {
      renderer.screenCTM = this.screenCTM;
      renderer.invalidateSizeChanged();
    });
  }
  public suspend(): void {
    this.renderers.forEach((renderer) => renderer.suspend());
  }
  public resume(): void {
    this.renderers.forEach((renderer) => renderer.resume());
  }
  public invalidate(): void {
    this.renderers.forEach((renderer) => renderer.invalidate());
  }

  public redraw(): void {
    this.renderers.forEach((renderer) => {
      // Method should be instant, avoid heavy operations:
      renderer.invalidateSizeChanged();
      if (renderer.redrawRequired()) {
        renderer.redraw();
      }
    });
  }
}
