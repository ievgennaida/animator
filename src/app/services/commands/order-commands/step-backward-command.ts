import { Injectable } from "@angular/core";
import { merge, Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { OrderAction } from "../../actions/order-actions/order-action";
import { OrderMode } from "../../actions/order-actions/order-mode";
import { OutlineService } from "../../outline.service";
import { SelectionService } from "../../selection.service";
import { UndoService } from "../../undo.service";

/**
 * Step backward
 */
@Injectable({
  providedIn: "root",
})
export class StepBackwardCommand implements BaseCommand {
  changed = new Subject<BaseCommand>();
  tooltip = "Send selected items one step back.";
  title = "Step Backward";
  icon = "vertical_align_bottom";
  hotkey = "Page Down";
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
    action.init(selected, OrderMode.oneStepBackwards);
    this.undoService.startAction(action, true);
  }
}

@Injectable({
  providedIn: "root",
})
export class OutlineStepBackwardCommand extends StepBackwardCommand {
  icon = "keyboard_arrow_up";
}
