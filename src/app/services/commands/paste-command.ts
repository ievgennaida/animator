import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/services/commands/base-command";

/**
 * Undo command
 */
@Injectable({
  providedIn: "root",
})
export class PasteCommand implements BaseCommand {
  constructor() {}

  tooltip = "Paste selected items";
  title = "Paste";
  icon = "";
  hotkey = "Ctrl+V";
  iconSVG = false;
  canExecute(): boolean {
    return false;
  }
  execute() {}
}
