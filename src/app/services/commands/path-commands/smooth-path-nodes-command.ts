import { Injectable } from "@angular/core";
import { merge, Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { SmoothPathNodesAction } from "../../actions/path-actions/smooth-path-nodes-action";
import { SelectionService } from "../../selection.service";
import { UndoService } from "../../undo.service";

/**
 * Smooth nodes command
 */
@Injectable({
  providedIn: "root",
})
export class SmoothNodesCommand implements BaseCommand {
  changed = new Subject<BaseCommand>();
  title = "Smooth";
  tooltip = `Make smooth selected path data nodes`;
  icon = "smooth-path";
  iconSVG = true;
  constructor(
    private selectionService: SelectionService,
    private undoService: UndoService
  ) {
    merge(
      this.selectionService.pathDataSubject,
      this.selectionService.selectedSubject
    ).subscribe(() => this.changed.next(this));
  }
  canExecute(): boolean {
    const selected = this.selectionService.pathDataSubject.getValues();
    if (selected && selected.length > 0) {
      return true;
    }

    return false;
  }
  execute(): void {
    if (!this.canExecute()) {
      return;
    }

    const selectedNodes = this.selectionService.pathDataSubject.getValues();
    const action = this.undoService.getAction(SmoothPathNodesAction);
    action.init(selectedNodes);
    this.undoService.startAction(action, true);
  }
}
