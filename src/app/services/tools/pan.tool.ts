import { Injectable } from "@angular/core";
import { CursorType } from "src/app/models/cursor-type";
import { MouseEventArgs } from "../../models/mouse-event-args";
import { CursorService } from "../cursor.service";
import { LoggerService } from "../logger.service";
import { MouseOverRenderer } from "../renderers/mouse-over.renderer";
import { ViewService } from "../view.service";
import { BaseTool } from "./base.tool";

@Injectable({
  providedIn: "root",
})
export class PanTool extends BaseTool {
  svgMatrix: DOMMatrix | null = null;
  mouseDownPos: DOMPoint | null = null;
  icon = "pan_tool";

  constructor(
    private viewService: ViewService,
    private logger: LoggerService,
    private cursor: CursorService,
    private mouseOverRenderer: MouseOverRenderer
  ) {
    super();
  }
  onActivate() {
    this.mouseOverRenderer.suspend(true);
    this.cursor.setCursor(CursorType.grab);
  }
  onDeactivate() {
    this.mouseOverRenderer.resume();
    this.cursor.applyDefault();
  }

  onWindowBlur(event: Event) {
    // Rollback pan
    this.cleanUp();
  }

  onViewportMouseDown(event: MouseEventArgs) {
    if (!this.viewService.isInit()) {
      return;
    }

    event.preventDefault();
    event.handled = true;
    this.svgMatrix = this.viewService.getCTM();
    if (this.svgMatrix) {
      this.mouseDownPos =
        event?.screenPoint?.matrixTransform(this.svgMatrix.inverse()) || null;
      this.cursor.setCursor(CursorType.grabbing);
    }
  }

  cleanUp() {
    this.cursor.setCursor(CursorType.grab);
    this.mouseDownPos = null;
  }
  onWindowMouseMove(event: MouseEventArgs) {
    if (!this.viewService.isInit() || !this.mouseDownPos) {
      return;
    }

    event.preventDefault();
    event.handled = true;
    const currentPoint = event.screenPoint;
    this.panByRelativePoint(currentPoint);
  }

  panByRelativePoint(point: SVGPoint | null) {
    if (!point || !this.svgMatrix || !this.mouseDownPos) {
      return;
    }

    point = point.matrixTransform(this.svgMatrix.inverse());
    this.svgMatrix = this.svgMatrix.translate(
      point.x - this.mouseDownPos.x,
      point.y - this.mouseDownPos.y
    );

    this.viewService.setCTM(this.svgMatrix);
  }

  onWindowMouseUp(event: MouseEventArgs) {
    if (this.mouseDownPos) {
      event.preventDefault();
      event.handled = true;
      this.panByRelativePoint(event.screenPoint);
    }

    this.cleanUp();
  }

  public getPan(): DOMPoint {
    const ctm = this.viewService.getCTM();
    if (!ctm) {
      return new DOMPoint();
    }
    return new DOMPoint(ctm.e, ctm.f);
  }
  pan(panX: number, panY: number) {
    const matrix = this.viewService.getCTM();
    if (matrix) {
      matrix.e = panX;
      matrix.f = panY;
      this.viewService.setCTM(matrix);
    } else {
      console.log("Cannot pan, main view service should be initialized");
    }
  }

  /**
   * fit the pan to the scene.
   *
   * @param rect rectangle to fit view for. use player svg if null.
   */
  fit(rect: DOMRect | null = null): void {
    if (!this.viewService.isInit()) {
      this.logger.log(
        "Pan: cannot center content. viewport should be initialed first."
      );
      return;
    }

    const zoom = this.viewService.getZoom();
    if (!rect) {
      rect = this.viewService.getWorkAreaSize();
    }

    const h = rect.height * zoom;
    const w = rect.width * zoom;
    const x = rect.x * zoom;
    const y = rect.y * zoom;

    const parent = this.viewService.svgRoot();
    if (!parent) {
      console.log("Root svg element should be initialized");
      return;
    }
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;

    this.pan(parentWidth / 2 - w / 2 - x, parentHeight / 2 - h / 2 - y);
  }
}
