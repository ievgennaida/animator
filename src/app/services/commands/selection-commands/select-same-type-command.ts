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
  constructor(private selectionService: SelectionService) {
    this.selectionService.selectedSubject
    .asObservable()
    .subscribe(() => this.changed.next(this));
  }
  changed = new Subject<BaseCommand>();
  tooltip = "Select all nodes with the same type";
  title = "Select Same Type";
  icon = "";
  hotkey = "";
  iconSVG = false;
  canExecute(): boolean {
    return this.selectionService.getSelected().length > 0;
  }
  execute() {
    this.selectionService.selectSameType();
  }
}