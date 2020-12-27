import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { SelectionService } from "../../selection.service";

@Injectable({
  providedIn: "root",
})
export class SelectAllCommand implements BaseCommand {
  constructor(private selectionService: SelectionService) {
  }

  tooltip = "Select All Nodes";
  title = "Select All";
  icon = "select_all";
  hotkey = "Ctrl+A";
  iconSVG = false;
  canExecute(): boolean {
    return true;
  }
  execute() {
    this.selectionService.selectAll();
  }
}
