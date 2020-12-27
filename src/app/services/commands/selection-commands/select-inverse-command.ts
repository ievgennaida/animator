import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { SelectionService } from "../../selection.service";

/**
 * Select Inverse
 */
@Injectable({
  providedIn: "root",
})
export class SelectInverseCommand implements BaseCommand {
  constructor(private selectionService: SelectionService) {
    this.selectionService.selectedSubject
      .asObservable()
      .subscribe(() => this.changed.next(this));
  }
  changed = new Subject<BaseCommand>();
  tooltip = "Deselect current selected nodes and select all other";
  title = "Select Inverse";
  icon = "";
  hotkey = "";
  iconSVG = false;
  canExecute(): boolean {
    return this.selectionService.getSelected().length > 0;
  }
  execute() {
    this.selectionService.inverseSelection();
  }
}
