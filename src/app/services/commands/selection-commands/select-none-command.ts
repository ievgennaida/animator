import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { SelectionService } from "../../selection.service";

/**
 * Deselect all command
 */
@Injectable({
  providedIn: "root",
})
export class SelectNoneCommand implements BaseCommand {
  constructor(private selectionService: SelectionService) {
    this.selectionService.selectedSubject
      .asObservable()
      .subscribe(() => this.changed.next(this));
  }
  changed = new Subject<BaseCommand>();
  title = "Deselect All";
  hotkey = "Ctrl+A";
  tooltip = `Deselect All (${this.hotkey})`;
  icon = "tab_unselected";
  iconSVG = false;
  canExecute(): boolean {
    return this.selectionService.getSelected().length > 0;
  }
  execute() {
    this.selectionService.deselectAll();
  }
}
