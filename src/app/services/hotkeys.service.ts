import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { EventManager } from "@angular/platform-browser";
import { RemoveElementCommand } from "./commands/remove-element-command";
import { UndoService } from "./undo.service";
import { OutlineService } from "./outline.service";
import { PasteService } from "./paste.service";
import { SelectionService } from "./selection.service";
import { PanTool } from "./viewport/pan.tool";
import { PathDirectSelectionTool } from "./viewport/path-direct-selection.tool";
import { SelectionTool } from "./viewport/selection.tool";
import { ToolsService } from "./viewport/tools.service";
import { ZoomTool } from "./viewport/zoom.tool";

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
    private pathTool: PathDirectSelectionTool,
    private pasteService: PasteService,
    private undoService: UndoService,
    private removeElementCommand: RemoveElementCommand,
    @Inject(DOCUMENT) private document: Document
  ) {}

  add(key: string, callback) {
    this.eventManager.addEventListener(this.document.body, key, (e: Event) => {
      callback(e);
      e.preventDefault();
    });
  }
  initialize() {
    // TODO: make it language invariant
    this.add(`keydown.control.a`, () => this.selectionService.selectAll());
    this.add(`keydown.control.x`, () => this.pasteService.cut());
    this.add(`keydown.control.z`, () => this.undoService.undo());
    this.add(`keydown.control.y`, () => this.undoService.redo());
    this.add(`keydown.control.c`, () => this.pasteService.copy());
    this.add(`keydown.control.p`, () => this.pasteService.paste());
    this.add(`keydown.delete`, () => this.removeElementCommand.execute());
    this.add(`keydown.v`, () =>
      this.toolsService.setActiveTool(this.selectionTool)
    );
    this.add(`keydown.a`, () => this.toolsService.setActiveTool(this.pathTool));
    this.add(`keydown.control.0`, () => {
      this.zoomTool.setDirectZoom(1);
    });
    this.add(`keydown.h`, () => this.toolsService.setActiveTool(this.panTool));
    this.add(`keydown.z`, () => this.toolsService.setActiveTool(this.zoomTool));
  }
}
