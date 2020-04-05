import { Injectable, NgZone } from "@angular/core";
import { LoggerService } from "../../logger.service";
import { BoundsRenderer } from "./bounds.renderer";
import { BaseRenderer } from "./base.renderer";
import { ViewService } from "../../view.service";
import { GridLinesRenderer } from "./grid-lines.renderer";
import { SelectorRenderer } from "./selector.renderer";
import { MouseOverRenderer } from "./mouse-over.renderer";

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
    private viewService: ViewService,
    protected logger: LoggerService,
    private ngZone: NgZone
  ) {
    super();
    this.renderers.push(gridLinesRenderer);
    this.renderers.push(boundsRenderer);
    // this.renderers.push(pathAdornersRenderer);
    this.renderers.push(mouseOverRenderer);
    this.renderers.push(selectorRenderer);
    this.startDrawLoop();
  }

  startDrawLoop() {
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

  onViewportSizeChanged() {
    if (!this.viewService.viewport) {
      return;
    }

    const parent = this.viewService.viewport.ownerSVGElement as SVGSVGElement;
    this.screenCTM = this.canvasCTM.multiply(parent.getScreenCTM().inverse());
    this.renderers.forEach((renderer) => {
      renderer.screenCTM = this.screenCTM;
      renderer.onViewportSizeChanged();
    });
  }

  public invalidate() {
    this.renderers.forEach((renderer) => renderer.invalidate());
  }

  public redraw() {
    this.renderers.forEach((renderer) => {
      if (renderer.redrawRequired()) {
        renderer.redraw();
      }
    });
  }
}
