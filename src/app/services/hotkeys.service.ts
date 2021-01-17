import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { EventManager } from "@angular/platform-browser";
import { CopyCommand } from "./commands/copy-command";
import { CutCommand } from "./commands/cut-command";
import { PasteCommand } from "./commands/paste-command";
import { RemoveSelectedCommand } from "./commands/remove-selected-command";
import { OutlineService } from "./outline.service";
import { SelectionService } from "./selection.service";
import { PanTool } from "./tools/pan.tool";
import { PathDirectSelectionTool } from "./tools/path-direct-selection.tool";
import { SelectionTool } from "./tools/selection.tool";
import { ToolsService } from "./tools/tools.service";
import { ZoomTool } from "./tools/zoom.tool";
import { UndoService } from "./undo.service";

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
    private undoService: UndoService,
    private cutCommand: CutCommand,
    private copyCommand: CopyCommand,
    private pasteCommand: PasteCommand,
    private removeSelectedCommand: RemoveSelectedCommand,
    @Inject(DOCUMENT) private document: Document
  ) {}

  add(key: string, callback: (e: KeyboardEvent) => void) {
    const keys = key.split(".");
    const charKey = keys[keys.length - 1].toLowerCase();
    let invariantKeyCode = charKey;
    if (invariantKeyCode.length === 1) {
      invariantKeyCode = `key${keys[keys.length - 1]}`;
    }
    invariantKeyCode = invariantKeyCode.toLowerCase();
    const isCtrl = !!keys.find((p) => p === "control");
    this.eventManager.addEventListener(
      this.document.body,
      "keydown",
      (e: KeyboardEvent) => {
        const pressedKey = e.key.toLowerCase();
        const code = pressedKey.charCodeAt(0);
        const isLatin =
          (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
        const keyMatch = isLatin
          ? pressedKey === charKey
          : e.code.toLowerCase() === invariantKeyCode;
        if (isCtrl === e.ctrlKey && keyMatch) {
          callback(e);
          e.preventDefault();
        }
      }
    );
  }
  initialize() {
    // TODO: make it language invariant
    this.add(`keydown.control.a`, () => this.selectionService.selectAll());
    this.add(`keydown.control.z`, () => this.undoService.undo());
    this.add(`keydown.control.y`, () => this.undoService.redo());
    this.add(`keydown.control.x`, () => {
      if (this.cutCommand.canExecute()) {
        this.cutCommand.execute();
      }
    });
    this.add(`keydown.control.c`, () => {
      if (this.copyCommand.canExecute()) {
        this.copyCommand.execute();
      }
    });
    this.add(`keydown.control.v`, () => {
      if (this.pasteCommand.canExecute()) {
        this.pasteCommand.execute();
      }
    });
    this.add(`keydown.delete`, () => this.removeSelectedCommand.execute());
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
