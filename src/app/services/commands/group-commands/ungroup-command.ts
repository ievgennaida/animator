import { Injectable } from "@angular/core";
import { merge, Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import {
  GroupAction,
  GroupMode,
} from "../../actions/group-actions/group-action";
import { OutlineService } from "../../outline.service";
import { SelectionService } from "../../selection.service";
import { UndoService } from "../../undo.service";
/**
 * Un group command.
 */
@Injectable({
  providedIn: "root",
})
export class UnGroupCommand implements BaseCommand {
  constructor(
    private selectionService: SelectionService,
    private outlineService: OutlineService,
    private undoService: UndoService
  ) {
    merge(
      this.selectionService.selected,
      this.outlineService.nodes
    ).subscribe(() => this.changed.next(this));
  }
  changed = new Subject<BaseCommand>();
  tooltip = "Group items in a group element";
  title = "Ungroup";
  iconSVG = false;

  canExecute(): boolean {
    return false;
  }
  execute() {
    if (this.canExecute && !this.canExecute()) {
      return;
    }
    const action = this.undoService.getAction<GroupAction>(GroupAction);
    const selected = this.selectionService.getSelected();
    action.iconSVG = this.iconSVG;
    action.init(selected, GroupMode.UnGroup);
    this.undoService.startAction(action, true);
  }
}
