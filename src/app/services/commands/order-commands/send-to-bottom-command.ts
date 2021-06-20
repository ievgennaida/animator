import { Injectable } from "@angular/core";
import { merge, Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import {
  OrderAction
} from "../../actions/order-actions/order-action";
import { OrderMode } from "../../actions/order-actions/order-mode";
import { OutlineService } from "../../outline.service";
import { SelectionService } from "../../selection.service";
import { UndoService } from "../../undo.service";
/**
 * Send to back
 */
@Injectable({
  providedIn: "root",
})
export class SendToBottomCommand implements BaseCommand {
  changed = new Subject<BaseCommand>();
  tooltip = "Send selected items to bottom.";
  title = "Send To Back";
  icon = "flip_to_back";
  hotkey = "End";
  iconSVG = false;
  constructor(
    private selectionService: SelectionService,
    private outlineService: OutlineService,
    private undoService: UndoService
  ) {
    merge(
      this.selectionService.selectedSubject,
      this.outlineService.nodesSubject
    ).subscribe(() => this.changed.next(this));
  }
  canExecute(): boolean {
    const selected = this.selectionService.getSelected();
    return OrderAction.canSendToBottom(selected);
  }
  execute(): void {
    if (this.canExecute && !this.canExecute()) {
      return;
    }
    const action = this.undoService.getAction(OrderAction);
    const selected = this.selectionService.getSelected();
    action.icon = this.icon;
    action.iconSVG = this.iconSVG;
    action.init(selected, OrderMode.back);
    this.undoService.startAction(action, true);
  }
}
