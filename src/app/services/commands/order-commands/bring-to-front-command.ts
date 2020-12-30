import { Injectable } from "@angular/core";
import { merge, Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import {
  OrderAction,
  OrderMode,
} from "../../actions/order-actions/order-action";
import { OutlineService } from "../../outline.service";
import { SelectionService } from "../../selection.service";
import { UndoService } from "../../undo.service";
/**
 * bring to front
 */
@Injectable({
  providedIn: "root",
})
export class BringToFrontCommand implements BaseCommand {
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
  tooltip = "Bring selected items to front.";
  title = "Bring To Front";
  icon = "flip_to_front";
  hotkey = "Home";
  iconSVG = false;

  canExecute(): boolean {
    const selected = this.selectionService.getSelected();
    return OrderAction.canSendToFront(selected);
  }
  execute() {
    if (this.canExecute && !this.canExecute()) {
      return;
    }
    const action = this.undoService.getAction(OrderAction);
    const selected = this.selectionService.getSelected();
    action.icon = this.icon;
    action.iconSVG = this.iconSVG;
    action.init(selected, OrderMode.Front);
    this.undoService.startAction(action, true);
  }
}
