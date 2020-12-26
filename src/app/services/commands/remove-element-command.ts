import { Injectable } from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { LoggerService } from "../logger.service";
import { OutlineService } from "../outline.service";
import { SelectionService } from "../selection.service";
import { BaseCommand } from "./base-command";
import { RemoveElementAction } from "../actions/remove-element-action";
import { UndoService } from "../undo.service";

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
  ) {}
  tooltip = "Remove selected items";
  title = "Delete";
  icon = "clear";
  hotkey = "Del";
  iconSVG = false;
  nodes: TreeNode[] | null = null;
  // Store previous indexes of the elements
  indexes: number[] = [];
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

    const action = this.undoService.getAction<RemoveElementAction>(
      RemoveElementAction
    );
    action.init(selectedNodes);
    this.undoService.startAction(action, true);
  }
}
