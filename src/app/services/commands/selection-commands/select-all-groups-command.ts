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
export class SelectAllGroupsCommand implements BaseCommand {
  constructor(private selectionService: SelectionService) {
  }
  changed = new Subject<BaseCommand>();
  tooltip = "Select all group nodes [g]";
  title = "Select All Groups";
  icon = "";
  hotkey = "";
  iconSVG = false;
  canExecute(): boolean {
    return true;
  }
  execute() {
    this.selectionService.selectAllGroups();
  }
}
