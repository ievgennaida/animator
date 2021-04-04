import { Injectable } from "@angular/core";
import { merge, Subject } from "rxjs";
import { TreeNode } from "src/app/models/tree-node";
import { RemovePathNodesAction } from "../../actions/path-actions/remove-path-nodes-action";
import { SelectionService } from "../../selection.service";
import { UndoService } from "../../undo.service";
import { BaseCommand } from "../base-command";

/**
 * Remove path data nodes command.
 */
@Injectable({
  providedIn: "root",
})
export class RemovePathNodesCommand implements BaseCommand {
  title = "Delete";
  icon = "clear";
  hotkey = "Del";
  tooltip = `Remove selected path nodes (${this.hotkey})`;
  iconSVG = false;
  nodes: TreeNode[] | null = null;
  // Store previous indexes of the elements
  indexes: number[] = [];
  changed = new Subject<BaseCommand>();
  constructor(
    private selectionService: SelectionService,
    private undoService: UndoService
  ) {
    merge(
      this.selectionService.pathDataSubject,
      this.selectionService.selected
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
    const action = this.undoService.getAction(RemovePathNodesAction);
    action.init(selectedNodes);
    this.undoService.startAction(action, true);
  }
}
