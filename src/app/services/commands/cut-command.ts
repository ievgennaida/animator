import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/services/commands/base-command";

/**
 * Cut command
 */
@Injectable({
  providedIn: "root",
})
export class CutCommand implements BaseCommand {
  constructor() {}

  tooltip = "Cut selected items";
  title = "Cut";
  icon = "cut";
  hotkey = "Ctrl+X";
  iconSVG = false;
  canExecute(): boolean {
    return false;
  }
  execute() {}
}
