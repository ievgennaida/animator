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
 * Step forward
 */
@Injectable({
  providedIn: "root",
})
export class StepForwardCommand implements BaseCommand {
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
  tooltip = "Bring selected items one step to front.";
  title = "Step Forward";
  icon = "vertical_align_top";
  hotkey = "Page Up";
  iconSVG = false;
  canExecute(): boolean {
    const selected = this.selectionService.getSelected();
    return OrderAction.canSendToFront(selected);
  }
  execute() {
    if (this.canExecute && !this.canExecute()) {
      return;
    }
    const action = this.undoService.getAction<OrderAction>(OrderAction);
    const selected = this.selectionService.getSelected();
    action.icon = this.icon;
    action.iconSVG = this.iconSVG;
    action.init(selected, OrderMode.OneStepForwards);
    this.undoService.startAction(action, true);
  }
}

@Injectable({
  providedIn: "root",
})
export class OutlineStepForwardCommand extends StepForwardCommand {
  icon = "keyboard_arrow_down";
}
