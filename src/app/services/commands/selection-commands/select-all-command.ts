import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/services/commands/base-command";
import { SelectionService } from "../../selection.service";

@Injectable({
  providedIn: "root",
})
export class SelectAllCommand implements BaseCommand {

  tooltip = "Select All Nodes";
  title = "Select All";
  icon = "select_all";
  hotkey = "Ctrl+A";
  iconSVG = false;
  constructor(private selectionService: SelectionService) {
  }

  canExecute(): boolean {
    return true;
  }
  execute(): void {
    this.selectionService.selectAll();
  }
}
