import { Injectable } from "@angular/core";
import { merge, Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { SmoothPathNodesAction } from "../../actions/path-actions/smooth-path-nodes-action";
import { SelectionService } from "../../selection.service";
import { UndoService } from "../../undo.service";
import {
  PathDirectSelectionTool,
  PathDirectSelectionToolMode,
} from "../../tools/path-direct-selection.tool";

/**
 * Change path tool mode to add new nodes.
 */
@Injectable({
  providedIn: "root",
})
export class AddPathNodesCommand implements BaseCommand {
  constructor(
    private selectionService: SelectionService,
    private undoService: UndoService,
    private pathDirectSelectionTool: PathDirectSelectionTool
  ) {
    pathDirectSelectionTool.modeSubject.subscribe(() =>
      this.changed.next(this)
    );
    merge(
      this.selectionService.pathDataSubject,
      this.selectionService.selected
    ).subscribe(() => this.changed.next(this));
  }
  changed = new Subject<BaseCommand>();
  title = "Add Path Nodes";
  tooltip = `Add Path Nodes`;
  icon = "add-black-18dp";
  iconSVG = true;
  get active() {
    return (
      this.pathDirectSelectionTool.mode === PathDirectSelectionToolMode.Add
    );
  }
  canExecute(): boolean {
    return true;
  }
  execute() {
    if (!this.canExecute()) {
      return;
    }
    if (this.active) {
      this.pathDirectSelectionTool.mode = PathDirectSelectionToolMode.Select;
    } else {
      this.pathDirectSelectionTool.mode = PathDirectSelectionToolMode.Add;
    }
  }
}
