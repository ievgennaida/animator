import { Injectable } from "@angular/core";
import { CursorType } from "src/app/models/cursor-type";
import { consts } from "src/environments/consts";
import { MouseEventArgs } from "../../models/mouse-event-args";
import { CursorService } from "../cursor.service";
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
  iconName = "search";
  constructor(
    private panTool: PanTool,
    private cursor: CursorService,
    private viewService: ViewService,
    private autoPanService: AutoPanService,
    private selectionTracker: SelectionRectTracker
  ) {
    super();
  }

  onActivate() {
    this.cursor.setCursor(CursorType.ZoomIn);
  }

  onDeactivate() {
    this.cursor.setCursor(CursorType.Default);
    this.cleanUp();
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
  onViewportMouseDown(event: MouseEventArgs) {
    if (event.rightClicked()) {
      this.cursor.setCursor(CursorType.ZoomOut);
    } else {
      this.selectionTracker.start(event);
    }
  }
  onWindowMouseMove(event: MouseEventArgs) {
    if (!this.selectionTracker.isActive()) {
      return;
    }
    this.selectionTracker.update(event);
    event.preventDefault();

    if (event) {
      this.autoPanService.update(event.clientX, event.clientY);
    }
  }
  onWindowBlur(e) {
    this.cleanUp();
  }
  onWindowMouseUp(e: MouseEventArgs) {
    this.startSelectionEnd(e);
  }
  startSelectionEnd(e) {
    try {
      this.selectionEnded(e, this.selectionTracker.rect);
    } finally {
      this.cleanUp();
    }
  }
  cleanUp() {
    this.selectionTracker.stop();
    this.autoPanService.stop();
    this.cursor.setCursor(CursorType.ZoomIn);
  }
  /**
   * Override base method.
   */
  selectionEnded(event: MouseEventArgs, selectedArea: DOMRect) {
    const isSelection =
      selectedArea &&
      selectedArea.width > consts.clickThreshold &&
      selectedArea.height > consts.clickThreshold;
    if (isSelection) {
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
    if (e && (e.shiftKey || e.ctrlKey || e.button === 2)) {
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
      if (!point) {
        point = new DOMPoint(0, 0);
      }
      point = Utils.toElementPoint(this.viewService, point);
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
