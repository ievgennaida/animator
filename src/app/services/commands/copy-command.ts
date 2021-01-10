import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/services/commands/base-command";

/**
 * copy element command
 */
@Injectable({
  providedIn: "root",
})
export class CopyCommand implements BaseCommand {
  constructor() {}

  tooltip = "Copy selected items";
  title = "Copy";
  icon = "file_copy";
  hotkey = "Ctrl+C";
  iconSVG = false;
  canExecute(): boolean {
    return false;
  }
  execute() {}
}
