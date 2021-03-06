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
  changed = new Subject<BaseCommand>();
  title = "Deselect All";
  hotkey = "Ctrl+A";
  tooltip = `Deselect All (${this.hotkey})`;
  icon = "tab_unselected";
  iconSVG = false;
  constructor(private selectionService: SelectionService) {
    this.selectionService.selectedSubject
      .subscribe(() => this.changed.next(this));
  }
  canExecute(): boolean {
    return this.selectionService.getSelected().length > 0;
  }
  execute(): void {
    this.selectionService.deselectAll();
  }
}
