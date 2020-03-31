import { BaseTool } from "./base.tool";
import { MouseEventArgs } from "./mouse-event-args";
import { Injectable } from "@angular/core";
import { LoggerService } from "../logger.service";
import { ViewService } from "../view.service";
import { BaseSelectionTool } from "./base-selection.tool";
import { PanTool } from "./pan.tool";
import { consts } from "src/environments/consts";
import { CursorService, CursorType } from "../cursor.service";
import { TransformsService } from "./transformations/transforms.service";
import { SelectorRenderer } from "./renderers/selector.renderer";

@Injectable({
  providedIn: "root",
})
export class ZoomTool extends BaseSelectionTool {
  iconName = "search";
  constructor(
    transformService: TransformsService,
    viewService: ViewService,
    logger: LoggerService,
    panTool: PanTool,
    selectorRenderer: SelectorRenderer,
    private cursor: CursorService
  ) {
    super(selectorRenderer, transformService, viewService, logger, panTool);
  }

  onActivate() {
    this.cursor.setCursor(CursorType.ZoomIn);
  }

  onDeactivate() {
    this.cursor.setCursor(CursorType.Default);
  }

  onWindowKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey) {
      this.cursor.setCursor(CursorType.ZoomOut);
    }
  }

  onWindowKeyUp(event: KeyboardEvent) {
    this.cursor.setCursor(CursorType.ZoomIn);
  }

  onViewportMouseWheel(event: MouseEventArgs) {
    if (!this.viewService.isInit()) {
      return;
    }
    event.preventDefault();
    event.handled = true;
    const direction = event.deltaY;
    this.zoom(direction, consts.zoom.sensitivityWheel, event);
  }

  cleanUp() {
    super.cleanUp();
  }

  /**
   * Override base method.
   */
  selectionEnded(event: MouseEventArgs, selectedArea: DOMRect) {
    const clickThreshold = 8;
    if (
      selectedArea &&
      selectedArea.width > clickThreshold &&
      selectedArea.height > clickThreshold
    ) {
      // Zoom to area when selection is made:
      this.fit(selectedArea);
      this.panTool.fit(selectedArea);
    } else {
      // check the bounds while it's window events:
      const area = this.viewService.getContainerClientRect();
      if (
        event.clientX >= area.left &&
        event.clientX <= area.right &&
        event.clientY >= area.top &&
        event.clientY <= area.bottom
      ) {
        this.zoomByMouseEvent(event);
      }
    }
  }

  zoomByMouseEvent(event: MouseEventArgs) {
    if (!this.viewService.isInit()) {
      return;
    }

    let direction = -1;
    const e = event.args as MouseEvent;
    if (e.shiftKey || e.ctrlKey || e.button === 2) {
      direction = 1;
    }

    this.zoom(direction, consts.zoom.sensitivityMouse, event);
    event.preventDefault();
  }

  zoomIn() {
    this.zoom(-1, consts.zoom.sensitivityMouse);
  }
  zoomOut() {
    this.zoom(1, consts.zoom.sensitivityMouse);
  }
  zoom(direction = 1, scale = 1, event: MouseEventArgs = null) {
    scale = 1 - direction * scale;
    if (scale !== 0) {
      let matrix = this.viewService.getCTM();
      let point = new DOMPoint(1, 1, 1, 1);
      if (event) {
        point = this.viewService
          .toSvgPoint(event.clientX, event.clientY)
          .matrixTransform(matrix.inverse());
      }

      // allow to set to the max
      let expectedScale = matrix.a * scale;
      if (expectedScale > consts.zoom.max) {
        scale = consts.zoom.max / matrix.a;
      } else if (expectedScale < consts.zoom.min) {
        scale = consts.zoom.min / matrix.a;
      }

      expectedScale = matrix.a * scale;
      if (
        expectedScale >= consts.zoom.min &&
        expectedScale <= consts.zoom.max
      ) {
        matrix = matrix
          .translate(point.x, point.y)
          .scale(scale, scale, scale)
          .translate(-point.x, -point.y);
        this.viewService.setCTM(matrix);
      }
    }
  }

  setDirectZoom(scale: number) {
    const matrix = this.viewService.getCTM();
    const zoom = Math.max(Math.min(scale, consts.zoom.max), consts.zoom.min);

    matrix.a = zoom;
    matrix.d = zoom;
    this.viewService.setCTM(matrix);
  }

  fit(rect: DOMRect = null) {
    if (!this.viewService.isInit()) {
      return;
    }

    if (!rect) {
      rect = this.viewService.getWorkAreaSize();
    }

    const parentSize = this.viewService.getContainerSize();

    let fitProportion = Math.min(
      parentSize.width / rect.width,
      parentSize.height / rect.height,
      consts.zoom.max
    );

    fitProportion = Math.max(fitProportion, consts.zoom.min);

    this.setDirectZoom(fitProportion);
  }
}
