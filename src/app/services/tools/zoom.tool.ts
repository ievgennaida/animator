import { Injectable } from "@angular/core";
import { CursorType } from "src/app/models/cursor-type";
import { consts } from "src/environments/consts";
import { MouseEventArgs } from "../../models/mouse-event-args";
import { CursorService } from "../cursor.service";
import { MouseOverRenderer } from "../renderers/mouse-over.renderer";
import { Utils } from "../utils/utils";
import { ViewService } from "../view.service";
import { AutoPanService } from "./auto-pan-service";
import { BaseTool } from "./base.tool";
import { PanTool } from "./pan.tool";
import { SelectionRectTracker } from "./selection-rect-tracker";

@Injectable({
  providedIn: "root",
})
export class ZoomTool extends BaseTool {
  icon = "search";
  constructor(
    private panTool: PanTool,
    private cursor: CursorService,
    private viewService: ViewService,
    private autoPanService: AutoPanService,
    private selectionTracker: SelectionRectTracker,
    private mouseOverRenderer: MouseOverRenderer
  ) {
    super();
  }

  onActivate(): void {
    this.mouseOverRenderer.suspend(true);
    this.cursor.setCursor(CursorType.zoomIn);
    super.onActivate();
  }

  onDeactivate(): void {
    this.mouseOverRenderer.resume();
    this.cursor.setCursor(CursorType.default);
    this.cleanUp();
    super.onDeactivate();
  }

  onWindowKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey) {
      this.cursor.setCursor(CursorType.zoomOut);
    }
  }

  onWindowKeyUp(event: KeyboardEvent): void {
    this.cursor.setCursor(CursorType.zoomIn);
  }

  onViewportMouseWheel(event: MouseEventArgs): void {
    if (!this.viewService.isInit()) {
      return;
    }
    event.preventDefault();
    event.handled = true;
    const direction = event.deltaY;
    this.zoom(direction, consts.zoom.sensitivityWheel, event);
  }
  onViewportMouseDown(event: MouseEventArgs): void {
    if (event.rightClicked()) {
      this.cursor.setCursor(CursorType.zoomOut);
    } else {
      this.selectionTracker.start(event);
    }
  }
  onWindowMouseMove(event: MouseEventArgs): void {
    if (!this.selectionTracker.isActive()) {
      return;
    }
    this.selectionTracker.update(event);
    event.preventDefault();

    if (event) {
      this.autoPanService.update(event.clientX, event.clientY);
    }
  }
  onWindowBlur(e: Event): void {
    this.cleanUp();
  }
  onWindowMouseUp(e: MouseEventArgs): void {
    this.startSelectionEnd(e);
  }
  startSelectionEnd(e: MouseEventArgs): void {
    try {
      this.selectionEnded(e, this.selectionTracker.rect);
    } finally {
      this.cleanUp();
    }
  }
  cleanUp(): void {
    this.selectionTracker.stop();
    this.autoPanService.stop();
    this.cursor.setCursor(CursorType.zoomIn);
  }
  /**
   * Override base method.
   */
  selectionEnded(event: MouseEventArgs, selectedArea: DOMRect | null): void {
    const isSelection =
      selectedArea &&
      selectedArea.width > consts.clickThreshold &&
      selectedArea.height > consts.clickThreshold;
    if (selectedArea && isSelection) {
      // Zoom to area when selection is made:
      this.fit(selectedArea);
      this.panTool.fit(selectedArea);
    } else {
      // check the bounds while it's window events:
      const area = this.viewService.getContainerClientRect();
      if (
        area &&
        event.clientX >= area.left &&
        event.clientX <= area.right &&
        event.clientY >= area.top &&
        event.clientY <= area.bottom
      ) {
        this.zoomByMouseEvent(event);
      }
    }
  }

  zoomByMouseEvent(event: MouseEventArgs): void {
    if (!this.viewService.isInit()) {
      return;
    }

    let direction = -1;
    const e = event.args as MouseEvent;
    if (e && (e.shiftKey || e.ctrlKey || e.button === 2)) {
      direction = 1;
    }

    this.zoom(direction, consts.zoom.sensitivityMouse, event);
    event.preventDefault();
  }

  zoomIn(): void {
    this.zoom(-1, consts.zoom.sensitivityMouse);
  }
  zoomOut(): void {
    this.zoom(1, consts.zoom.sensitivityMouse);
  }
  zoom(direction = 1, scale = 1, event: MouseEventArgs | null = null): void {
    scale = 1 - direction * scale;
    if (scale !== 0) {
      let matrix = this.viewService.getCTM();
      if (!matrix) {
        console.log("zoom: Viewport is not ready.");
        return;
      }
      let point = null;
      if (event) {
        point = event.screenPoint;
      } else {
        point = this.viewService.getScreenSize();
        if (point) {
          point.x /= 2;
          point.y /= 2;
        }
      }

      point = point || new DOMPoint(0, 0);
      point = Utils.toElementPoint(this.viewService, point);
      if (!point) {
        return;
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

  setDirectZoom(scale: number): void {
    const matrix = this.viewService.getCTM();
    if (!matrix) {
      return;
    }
    const zoom = Math.max(Math.min(scale, consts.zoom.max), consts.zoom.min);

    matrix.a = zoom;
    matrix.d = zoom;
    this.viewService.setCTM(matrix);
  }

  fit(rect: DOMRect | null = null): void {
    if (!this.viewService.isInit()) {
      return;
    }

    if (!rect) {
      rect = this.viewService.getWorkAreaSize();
    }

    const parentSize = this.viewService.getContainerSize();
    if (!parentSize) {
      return;
    }
    let fitProportion = Math.min(
      parentSize.width / rect.width,
      parentSize.height / rect.height,
      consts.zoom.max
    );

    fitProportion = Math.max(fitProportion, consts.zoom.min);

    this.setDirectZoom(fitProportion);
  }
}
