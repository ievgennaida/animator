import { Injectable, Inject } from "@angular/core";
import { EventManager } from "@angular/platform-browser";
import { DOCUMENT } from "@angular/common";
import { OutlineService } from "./outline.service";
import { SelectionService } from "./selection.service";
import { ToolsService } from "./viewport/tools.service";
import { PanTool } from "./viewport/pan.tool";
import { SelectionTool } from "./viewport/selection.tool";
import { ZoomTool } from "./viewport/zoom.tool";
import { PathTool } from "./viewport/path.tool";

@Injectable({
  providedIn: "root",
})
export class HotkeysService {
  constructor(
    private eventManager: EventManager,
    private outlineService: OutlineService,
    private selectionService: SelectionService,
    private toolsService: ToolsService,
    private panTool: PanTool,
    private zoomTool: ZoomTool,
    private selectionTool: SelectionTool,
    private pathTool: PathTool,
    @Inject(DOCUMENT) private document: Document
  ) {}

  initialize() {
    this.eventManager.addEventListener(
      document.body,
      `keydown.control.a`,
      () => {
        this.selectionService.selectAll();
      }
    );
    this.eventManager.addEventListener(document.body, `keydown.v`, () => {
      this.toolsService.setActiveTool(this.selectionTool);
    });
    this.eventManager.addEventListener(document.body, `keydown.a`, () => {
      this.toolsService.setActiveTool(this.pathTool);
    });
    this.eventManager.addEventListener(document.body, `keydown.h`, () => {
      this.toolsService.setActiveTool(this.panTool);
    });
    this.eventManager.addEventListener(document.body, `keydown.z`, () => {
      this.toolsService.setActiveTool(this.zoomTool);
    });
  }
}
