import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { SelectionService } from "../../selection.service";
/**
 * Step forward
 */
@Injectable({
  providedIn: "root",
})
export class StepForwardCommand implements BaseCommand {
  constructor(private selectionService: SelectionService) {
    this.selectionService.selected.subscribe(() => this.changed.next(this));
  }
  changed = new Subject<BaseCommand>();
  tooltip = "Bring selected items one step to front.";
  title = "Step Forward";
  icon = "vertical_align_top";
  hotkey = "Page Up";
  iconSVG = false;
  canExecute(): boolean {
    return false;
  }
  execute() {}
}
