import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { SelectionService } from "../../selection.service";

@Injectable({
  providedIn: "root",
})
export class SelectAllCommand implements BaseCommand {
  constructor(private selectionService: SelectionService) {
    this.selectionService.selectedSubject
      .asObservable()
      .subscribe(() => this.changed.next(this));
  }
  changed = new Subject<BaseCommand>();
  tooltip = "Select All Nodes";
  title = "Select All";
  icon = "select_all";
  hotkey = "Ctrl+A";
  iconSVG = false;
  canExecute(): boolean {
    return this.selectionService.getSelected().length > 0;
  }
  execute() {
    this.selectionService.selectAll();
  }
}
