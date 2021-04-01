import { Injectable } from "@angular/core";
import { OutlineService } from "../outline.service";
import { BaseCommand } from "./base-command";

/**
 * Cut command
 */
@Injectable({
  providedIn: "root",
})
export class CollapseAllCommand implements BaseCommand {

  tooltip = "Collapse all tree nodes.";
  title = "Collapse all";
  icon = "remove";
  hotkey = "";
  iconSVG = false;
  constructor(private outlineService: OutlineService) {}

  canExecute(): boolean {
    return true;
  }
  execute() {
      this.outlineService.collapseAll();
  }
}
