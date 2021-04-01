import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { TreeNode } from "src/app/models/tree-node";
import { RemoveElementAction } from "../actions/remove-element-action";
import { LoggerService } from "../logger.service";
import { SelectionService } from "../selection.service";
import { UndoService } from "../undo.service";
import { BaseCommand } from "./base-command";

/**
 * Undo/redo remove element action
 */
@Injectable({
  providedIn: "root",
})
export class RemoveElementCommand implements BaseCommand {


  title = "Delete";
  icon = "clear";
  hotkey = "Del";
  tooltip = `Remove selected items (${this.hotkey})`;
  iconSVG = false;
  nodes: TreeNode[] | null = null;
  // Store previous indexes of the elements
  indexes: number[] = [];
  changed = new Subject<BaseCommand>();
  constructor(
    protected selectionService: SelectionService,
    protected undoService: UndoService,
    protected logger: LoggerService
  ) {
    this.selectionService.selected.subscribe(() => this.changed.next(this));
  }
  canRemove(nodes: TreeNode[]): boolean {
    const selected = nodes.filter((p) => p.allowRemove);
    if (selected && selected.length > 0) {
      return true;
    }
  }
  canExecute(): boolean {
    // Check whether all selected can be removed.
    return this.canRemove(this.selectionService.getSelected());
  }
  execute() {
    if (!this.canExecute()) {
      return;
    }

    this.undoService.executeAction(RemoveElementAction, (action) => {
      const selectedNodes = this.selectionService.getTopSelectedNodes();
      action.init(selectedNodes);
    });
  }
}
