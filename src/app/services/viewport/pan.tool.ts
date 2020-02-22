import { BaseTool } from "./base.tool";
import { MouseEventArgs } from "./MouseEventArgs";
import { Injectable } from "@angular/core";
import { LoggerService } from "../logger.service";
import { ViewportService } from "./viewport.service";
import { CursorService, CursorType } from '../cursor.service';

@Injectable({
  providedIn: "root"
})
export class PanTool extends BaseTool {
  svgMatrix: DOMMatrix = null;
  mouseDownPos: DOMPoint = null;
  iconName = "pan_tool";

  constructor(
    private viewportService: ViewportService,
    private logger: LoggerService,
    private cursor: CursorService
  ) {
    super();
  }
  onActivate(){
    this.cursor.setCursor(CursorType.Grab);
  }
  onDeactivate(){
    this.cursor.setCursor(CursorType.Default);
  }
  onViewportResize() {}

  onWindowBlur(event: Event) {
    // Rollback pan
    this.cleanUp();
  }

  onViewportMouseDown(event: MouseEventArgs) {
    if (!this.viewportService.isInit()) {
      return;
    }

    event.preventDefault();
    event.handled = true;
    this.svgMatrix = this.viewportService.getCTM();
    const point = this.viewportService.toSvgPoint(event.clientX, event.clientY);
    this.mouseDownPos = point.matrixTransform(this.svgMatrix.inverse());
    this.cursor.setCursor(CursorType.Grabbing);
  }

  cleanUp() {
    this.cursor.setCursor(CursorType.Grab);
    this.mouseDownPos = null;
  }
  onWindowMouseMove(event: MouseEventArgs) {
    if (!this.viewportService.isInit() || !this.mouseDownPos) {
      return;
    }

    event.preventDefault();
    event.handled = true;
    const currentPoint = this.viewportService.toSvgPoint(
      event.clientX,
      event.clientY
    );
    this.panByRelativePoint(currentPoint);
  }

  panByRelativePoint(point: SVGPoint) {
    point = point.matrixTransform(this.svgMatrix.inverse());
    this.svgMatrix = this.svgMatrix.translate(
      point.x - this.mouseDownPos.x,
      point.y - this.mouseDownPos.y
    );

    this.viewportService.setCTM(this.svgMatrix);
  }

  onWindowMouseUp(event: MouseEventArgs) {
    if (this.mouseDownPos) {
      event.preventDefault();
      event.handled = true;
      const currentPoint = this.viewportService.toSvgPoint(
        event.clientX,
        event.clientY
      );
      this.panByRelativePoint(currentPoint);
    }

    this.cleanUp();
  }

  pan(panX: number, panY: number) {
    const matrix = this.viewportService.getCTM();
    matrix.e = panX;
    matrix.f = panY;
    this.viewportService.setCTM(matrix);
  }

  /**
   * fit the pan to the scene.
   * @param rect rectagle to fit view for. use player svg if null.
   */
  fit(rect: DOMRect = null) {
    if (!this.viewportService.isInit()) {
      this.logger.log(
        "Pan: cannot center content. vieport should be initiazed first."
      );
      return;
    }

    const matrix = this.viewportService.getCTM();
    const zoom = matrix.a;
    if (!rect) {
      rect = this.viewportService.getWorkAreaSize();
    }

    const h = rect.height * zoom;
    const w = rect.width * zoom;
    const x = rect.x * zoom;
    const y = rect.y * zoom;

    const parent = this.viewportService.viewport.ownerSVGElement;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;

    this.pan(parentWidth / 2 - w / 2 - x, parentHeight / 2 - h / 2 - y);
  }
}
