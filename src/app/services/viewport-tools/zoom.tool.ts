import { BaseTool } from "./base.tool";
import { MouseEventArgs } from "./MouseEventArgs";
import { Injectable } from "@angular/core";
import { LoggerService } from "../logger.service";
import { ViewportService } from "./viewport.service";

@Injectable({
  providedIn: "root"
})
export class ZoomTool extends BaseTool {
  sensitivityWheel = 0.04;
  sensitivityMouse = 0.1;

  currentZoom = 1;
  min = 0.1;
  max = 2;

  viewport: SVGElement = null;
  iconName = "search";
  constructor(
    private viewportService: ViewportService,
    private logger: LoggerService
  ) {
    super();
  }

  onViewportMouseWheel(event: MouseEventArgs) {
    if (!this.viewportService.isInit()) {
      return;
    }

    event.handled = true;
    const direction = event.deltaY;
    this.zoom(direction, this.sensitivityWheel, event);
  }

  onViewportMouseUp(event: MouseEventArgs) {
    if (!this.viewportService.isInit()) {
      return;
    }

    let direction = -1;
    if (event.args.shiftKey || event.args.ctrlKey) {
      direction = 1;
    }

    this.zoom(direction, this.sensitivityMouse, event);
  }

  zoom(direction = 1, scale = 1, event: MouseEventArgs = null) {
    scale = 1 - direction * scale;
    if (scale !== 0) {
      let matrix = this.viewportService.getCTM();
      let point = new DOMPoint(1, 1, 1, 1);
      if (event) {
        point = this.viewportService
          .toSvgPoint(event.clientX, event.clientY)
          .matrixTransform(matrix.inverse());
      }

      const expectedScale = matrix.a * scale;
      if (expectedScale > this.min && expectedScale < this.max) {
        matrix = matrix
          .translate(point.x, point.y)
          .scale(scale, scale, scale)
          .translate(-point.x, -point.y);
        this.viewportService.setCTM(matrix);
      }
    }
  }
  setDirectZoom(scale:number){
    const matrix = this.viewportService.getCTM();
    matrix.a = scale;
    matrix.d = scale;
    this.viewportService.setCTM(matrix);
  }

  fit() {
    if (!this.viewportService.isInit()) {
      return;
    }

    const size = this.viewportService.getWorkAreaSize();
    const parentSize = this.viewportService.getContainerSize();

    const fitProportion = Math.min(
      parentSize.width / size.width,
      parentSize.height / size.height
    );

    this.setDirectZoom(fitProportion);
  }
}
