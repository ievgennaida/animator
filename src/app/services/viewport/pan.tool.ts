import { BaseTool } from "./base.tool";
import { MouseEventArgs } from "./mouse-event-args";
import { Injectable } from "@angular/core";
import { LoggerService } from "../logger.service";
import { ViewService } from "../view.service";
import { CursorService } from '../cursor.service';
import { CursorType } from 'src/app/models/cursor-type';

@Injectable({
  providedIn: "root"
})
export class PanTool extends BaseTool {
  svgMatrix: DOMMatrix = null;
  mouseDownPos: DOMPoint = null;
  iconName = "pan_tool";

  constructor(
    private viewService: ViewService,
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
    this.mouseDownPos = event.screenPoint.matrixTransform(this.svgMatrix.inverse());
    this.cursor.setCursor(CursorType.Grabbing);
  }

  cleanUp() {
    this.cursor.setCursor(CursorType.Grab);
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

  panByRelativePoint(point: SVGPoint) {
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

  pan(panX: number, panY: number) {
    const matrix = this.viewService.getCTM();
    matrix.e = panX;
    matrix.f = panY;
    this.viewService.setCTM(matrix);
  }

  /**
   * fit the pan to the scene.
   * @param rect rectagle to fit view for. use player svg if null.
   */
  fit(rect: DOMRect = null) {
    if (!this.viewService.isInit()) {
      this.logger.log(
        "Pan: cannot center content. vieport should be initiazed first."
      );
      return;
    }

    const zoom = this.viewService.getZoom()
    if (!rect) {
      rect = this.viewService.getWorkAreaSize();
    }

    const h = rect.height * zoom;
    const w = rect.width * zoom;
    const x = rect.x * zoom;
    const y = rect.y * zoom;

    const parent = this.viewService.viewport.ownerSVGElement;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;

    this.pan(parentWidth / 2 - w / 2 - x, parentHeight / 2 - h / 2 - y);
  }
}
