import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { TreeNode } from "src/app/models/tree-node";
import { RemoveElementAction } from "../actions/remove-element-action";
import { LoggerService } from "../logger.service";
import { SelectionService } from "../selection.service";
import { UndoService } from "../undo.service";
import { BaseCommand } from "./base-command";

/**
 * Undo/redo add element action
 */
@Injectable({
  providedIn: "root",
})
export class RemoveElementCommand implements BaseCommand {
  constructor(
    private selectionService: SelectionService,
    private undoService: UndoService,
    private logger: LoggerService
  ) {
    this.selectionService.selected.subscribe(() => this.changed.next(this));
  }
  tooltip = "Remove selected items";
  title = "Delete";
  icon = "clear";
  hotkey = "Del";
  iconSVG = false;
  nodes: TreeNode[] | null = null;
  // Store previous indexes of the elements
  indexes: number[] = [];
  changed = new Subject<BaseCommand>();
  canExecute(): boolean {
    const selected = this.selectionService.getSelected();
    if (selected && selected.length > 0) {
      const nodeCannotBeRemoved = selected.find((p) => !p.allowDelete);
      if (nodeCannotBeRemoved) {
        return false;
      }
      return true;
    }

    return false;
  }
  execute() {
    if (!this.canExecute()) {
      return;
    }

    const selectedNodes = this.selectionService.getTopSelectedNodes();

    if (this.logger.isDebug()) {
      const title = selectedNodes.length === 1 ? selectedNodes[0].name : "";
      this.logger.log(`Remove command: (${selectedNodes.length}) ${title}`);
    }

    const action = this.undoService.getAction(
      RemoveElementAction
    );
    action.init(selectedNodes);
    this.undoService.startAction(action, true);
  }
}
