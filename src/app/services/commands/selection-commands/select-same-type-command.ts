import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { SelectionService } from "../../selection.service";

/**
 * Select Same
 */
@Injectable({
  providedIn: "root",
})
export class SelectSameCommand implements BaseCommand {
  changed = new Subject<BaseCommand>();
  tooltip = "Select all nodes with the same type";
  title = "Select Same Type";
  icon = "";
  hotkey = "";
  iconSVG = false;
  constructor(private selectionService: SelectionService) {
    this.selectionService.selectedSubject
      .subscribe(() => this.changed.next(this));
  }
  canExecute(): boolean {
    return this.selectionService.getSelected().length > 0;
  }
  execute(): void {
    this.selectionService.selectSameType();
  }
}
