import { Injectable } from "@angular/core";
import { merge, Subject } from "rxjs";
import { TreeNode } from "src/app/models/tree-node";
import { BaseCommand } from "./base-command";
import { RemovePathNodesCommand } from "./path-commands/remove-path-nodes-command";
import { RemoveElementCommand } from "./remove-element-command";

/**
 * Undo/redo remove selected items.
 * Automatically delegate the remove selected to a concrete command.
 */
@Injectable({
  providedIn: "root",
})
export class RemoveSelectedCommand implements BaseCommand {
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
    protected removeElementCommand: RemoveElementCommand,
    protected removePathNodesCommand: RemovePathNodesCommand
  ) {
    merge(
      removeElementCommand.changed,
      removePathNodesCommand.changed
    ).subscribe(() => this.changed.next(this));
  }
  canExecute(): boolean {
    if (
      this.removePathNodesCommand.canExecute() ||
      this.removeElementCommand.canExecute()
    ) {
      return true;
    }
    return false;
  }
  execute(): void {
    if (this.removePathNodesCommand.canExecute()) {
      this.removePathNodesCommand.execute();
    } else if (this.removeElementCommand.canExecute()) {
      this.removeElementCommand.execute();
    }
  }
}
