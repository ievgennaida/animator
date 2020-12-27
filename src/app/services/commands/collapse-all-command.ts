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
  constructor(private outlineService: OutlineService) {}

  tooltip = "Collapse all tree nodes.";
  title = "Collapse all";
  icon = "remove";
  hotkey = "";
  iconSVG = false;
  canExecute(): boolean {
    return true;
  }
  execute() {
      this.outlineService.collapseAll();
  }
}
