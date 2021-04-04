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
  tooltip = "Expand All Tree Nodes";
  title = "Expand All";
  icon = "add";
  hotkey = "";
  iconSVG = false;
  constructor(private outlineService: OutlineService) {}

  canExecute(): boolean {
    return true;
  }
  execute(): void {
      this.outlineService.expandAll();
  }
}
