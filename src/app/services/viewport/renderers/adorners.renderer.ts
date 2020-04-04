import { Injectable, NgZone } from "@angular/core";
import { LoggerService } from "../../logger.service";
import { BoundsRenderer } from "./bounds.renderer";
import { BaseRenderer } from "./base.renderer";
import { OutlineService } from "../../outline.service";
import { TransformsService } from "../transformations/transforms.service";
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
    private boundsRenderer: BoundsRenderer,
    private selectorRenderer: SelectorRenderer,
    private mouseOverRenderer: MouseOverRenderer,
    private transformsService: TransformsService,
    private viewService: ViewService,
    protected logger: LoggerService,
    private ngZone: NgZone,
    private gridLinesRenderer: GridLinesRenderer,
    protected outlineService: OutlineService
  ) {
    super();

    // TODO: move it out
    this.outlineService.mouseOver.subscribe(() => {
      this.boundsRenderer.invalidate();
    });

    this.outlineService.selected.subscribe(() => {
      this.boundsRenderer.invalidate();
    });

    // Individual element is transformed.
    this.transformsService.transformed.subscribe(() => {
      this.boundsRenderer.invalidate();
    });

    // view is transformed
    this.viewService.transformed.subscribe(() => {
      this.invalidate();
      this.onViewportSizeChanged();
    });

    // view resized
    this.viewService.viewportResize.subscribe(() => {
      this.onViewportSizeChanged();
    });

    this.renderers.push(this.gridLinesRenderer);
    this.renderers.push(this.boundsRenderer);
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
