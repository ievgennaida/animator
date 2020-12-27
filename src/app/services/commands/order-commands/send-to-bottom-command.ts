import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { SelectionService } from "../../selection.service";
/**
 * Send to back
 */
@Injectable({
  providedIn: "root",
})
export class SendToBottomCommand implements BaseCommand {
  constructor(
    private selectionService: SelectionService
  ) {
    this.selectionService.selected.subscribe(() => this.changed.next(this));
  }
  changed = new Subject<BaseCommand>();
  tooltip = "Send selected items to bottom.";
  title = "Send To Back";
  icon = "flip_to_back";
  hotkey = "End";
  iconSVG = false;
  canExecute(): boolean {
    return false;
  }
  execute() {

  }
}
