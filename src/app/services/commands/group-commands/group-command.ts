import { Injectable } from "@angular/core";
import { merge, Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import {
  GroupAction
} from "../../actions/group-actions/group-action";
import { GroupMode } from "../../actions/group-actions/group-mode";
import { OutlineService } from "../../outline.service";
import { SelectionService } from "../../selection.service";
import { UndoService } from "../../undo.service";
/**
 * bring to front
 */
@Injectable({
  providedIn: "root",
})
export class GroupCommand implements BaseCommand {
  changed = new Subject<BaseCommand>();
  tooltip = "Group items in a group element";
  title = "Group";
  iconSVG = false;
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
  canExecute(): boolean {
    return false;
  }
  execute() {
    if (this.canExecute && !this.canExecute()) {
      return;
    }
    const action = this.undoService.getAction(GroupAction);
    const selected = this.selectionService.getSelected();
    action.iconSVG = this.iconSVG;
    action.init(selected, GroupMode.group);
    this.undoService.startAction(action, true);
  }
}
