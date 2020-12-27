import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { SelectionService } from "../../selection.service";
/**
 * bring to front
 */
@Injectable({
  providedIn: "root",
})
export class BringToFrontCommand implements BaseCommand {
  constructor(private selectionService: SelectionService) {
    this.selectionService.selected.subscribe(() => this.changed.next(this));
  }
  changed = new Subject<BaseCommand>();
  tooltip = "Bring selected items to front.";
  title = "Bring To Front";
  icon = "flip_to_front";
  hotkey = "Home";
  iconSVG = false;
  canExecute(): boolean {
    return false;
  }
  execute() {}
}
