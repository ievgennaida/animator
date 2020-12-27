import { Injectable } from "@angular/core";
import { OutlineService } from "../outline.service";
import { BaseCommand } from "./base-command";

/**
 * Expand All Command
 */
@Injectable({
  providedIn: "root",
})
export class ExpandAllCommand implements BaseCommand {
  constructor(private outlineService: OutlineService) {}

  tooltip = "Expand All Tree Nodes";
  title = "Expand All";
  icon = "add";
  hotkey = "";
  iconSVG = false;
  canExecute(): boolean {
    return true;
  }
  execute() {
      this.outlineService.expandAll();
  }
}
