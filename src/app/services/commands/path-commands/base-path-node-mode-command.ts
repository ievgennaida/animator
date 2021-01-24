import { Injectable } from "@angular/core";
import { merge, Subject } from "rxjs";
import { PathDirectSelectionToolMode } from "src/app/models/path-direct-selection-tool-mode";
import { BaseCommand } from "src/app/services/commands/base-command";
import { PathDirectSelectionTool } from "../../tools/path-direct-selection.tool";
import { UndoService } from "../../undo.service";

/**
 * Change path tool mode to add new nodes.
 */
@Injectable({
  providedIn: "root",
})
export class BasePathNodesCommand implements BaseCommand {
  constructor(
    private pathDirectSelectionTool: PathDirectSelectionTool,
    private undoService: UndoService
  ) {
    merge(
      this.undoService.actionIndexSubject,
      pathDirectSelectionTool.modeSubject
    ).subscribe(() => this.changed.next(this));
  }
  expectedMode = PathDirectSelectionToolMode.Add;
  changed = new Subject<BaseCommand>();
  iconSVG = true;
  get active() {
    // Don't allow to change mode during the running transaction:
    return this.pathDirectSelectionTool.mode === this.expectedMode;
  }
  canExecute(): boolean {
    // No running action:
    const active = this.undoService.getLastAction();
    if (active && !active.committed) {
      return false;
    }
    return true;
  }
  execute() {
    if (!this.canExecute()) {
      return;
    }
    if (this.pathDirectSelectionTool.mode !== this.expectedMode) {
      this.pathDirectSelectionTool.mode = this.expectedMode;
    }
  }
}
