import { Injectable } from "@angular/core";
import { PanTool } from "./pan.tool";
import { MouseEventArgs } from "./MouseEventArgs";
import { BaseTool } from "./base.tool";
import { ZoomTool } from "./zoom.tool";
import { BehaviorSubject } from "rxjs";
import { SelectionTool } from "./selection.tool";
import { ScrollbarsPanTool } from './scrollbars-pan.tool';

/**
 * Handle current active tool and services.
 */
@Injectable({
  providedIn: "root"
})
export class ToolsService {
  activeToolSubject = new BehaviorSubject<BaseTool>(null);
  public tools: Array<BaseTool> = [];
  private activeTool = null;

  constructor(
    private panTool: PanTool,
    private zoomTool: ZoomTool,
    private selectionTool: SelectionTool,
    // Special tool to control pan by scrollbars
    private scrollbarsPanTool: ScrollbarsPanTool
  ) {
    this.tools.push(selectionTool);
    this.tools.push(panTool);
    this.tools.push(zoomTool);
    this.setActiveTool(panTool);
  }

  getActiveTool(): BaseTool {
    return this.activeTool;
  }

  activeToolChanged() {
    return this.activeToolSubject.asObservable();
  }

  setActiveTool(tool: BaseTool) {
    if (this.activeTool !== tool) {
      this.activeTool = tool;
      this.activeToolSubject.next(this.activeTool);
    }
  }

  onViewportTouchStart(event: TouchEvent) {
    this.activeTool.onViewportMouseDown(new MouseEventArgs(event));
  }
  onViewportTouchEnd(event: TouchEvent) {
    this.activeTool.onViewportMouseUp(new MouseEventArgs(event));
  }
  onViewportTouchMove(event: TouchEvent) {
    this.activeTool.onViewportMouseMove(new MouseEventArgs(event));
  }
  onViewportTouchLeave(event: TouchEvent) {
    this.activeTool.onViewportMouseLeave(new MouseEventArgs(event));
  }
  onViewportTouchCancel(event: TouchEvent) {
    this.activeTool.onViewportMouseUp(new MouseEventArgs(event));
  }

  onViewportMouseLeave(event: MouseEvent) {
    this.activeTool.onViewportMouseLeave(new MouseEventArgs(event));
  }
  onViewportMouseDown(event: MouseEvent) {
    this.activeTool.onViewportMouseDown(new MouseEventArgs(event));
  }
  onViewportMouseUp(event: MouseEvent) {
    this.activeTool.onViewportMouseUp(new MouseEventArgs(event));
  }
  onViewportMouseWheel(event: WheelEvent) {
    const mouseArgs = new MouseEventArgs(event);
    this.activeTool.onViewportMouseWheel(mouseArgs);

    // Allow to zoom by mouse wheel for all the modes
    if (!mouseArgs.handled && this.activeTool !== this.zoomTool) {
      this.zoomTool.onViewportMouseWheel(mouseArgs);
    }
  }
  onViewportBlur(event: Event) {
    this.activeTool.onViewportBlur(event);
  }
  onWindowMouseLeave(event: MouseEvent) {
    this.activeTool.onWindowMouseLeave(new MouseEventArgs(event));
  }
  onWindowMouseDown(event: MouseEvent) {
    this.activeTool.onWindowMouseDown(new MouseEventArgs(event));
  }
  onWindowMouseMove(event: MouseEvent) {
    this.activeTool.onWindowMouseMove(new MouseEventArgs(event));
  }
  onWindowMouseUp(event: MouseEvent) {
    this.activeTool.onWindowMouseUp(new MouseEventArgs(event));
  }
  onWindowMouseWheel(event: WheelEvent) {
    this.activeTool.onWindowMouseWheel(new MouseEventArgs(event));
  }

  onWindowBlur(event: Event) {
    this.activeTool.onWindowBlur(event);
  }

  getPan() {}
  /**
   * Fit zoom and pan.
   */
  fitViewport() {
    this.zoomTool.fit();
    this.panTool.fit();
  }
}
