import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { SelectionService } from "../../selection.service";
/**
 * Step backward
 */
@Injectable({
  providedIn: "root",
})
export class StepBackwardCommand implements BaseCommand {
  constructor(
    private selectionService: SelectionService
  ) {
    this.selectionService.selected.subscribe(() => this.changed.next(this));
  }
  changed = new Subject<BaseCommand>();
  tooltip = "Send selected items one step back.";
  title = "Step Backward";
  icon = "vertical_align_bottom";
  hotkey = "Page Down";
  iconSVG = false;
  canExecute(): boolean {
    return false;
  }
  execute() {}
}
