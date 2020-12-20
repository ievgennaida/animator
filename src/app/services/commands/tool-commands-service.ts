import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/services/commands/base-command";
import { BaseTool } from "../viewport/base.tool";
import { SelectionTool } from "../viewport/selection.tool";
import { BBoxModeCommand } from "./bbox-mode-command";
import { UntransformCommand } from "./untransform-command";

/**
 * Handle current active tool and services.
 */
@Injectable({
  providedIn: "root",
})
export class ToolCommandsService {
  constructor(
    private bboxRectOnlyCommand: BBoxModeCommand,
    private untransformCommand: UntransformCommand
  ) {}

  getContextCommands(): BaseCommand[] {
    return [this.untransformCommand];
  }
  getCommands(tool: BaseTool): BaseCommand[] {
    if (!tool) {
      return [];
    }
    if (tool instanceof SelectionTool) {
      return [this.bboxRectOnlyCommand];
    }
    return [];
  }

  executeCommand(
    command: BaseCommand,
    allCommands: BaseCommand[] | null = null
  ): void {
    if (allCommands) {
      allCommands.forEach((p) => {
        if (command !== p && command.group && command.group === p.group) {
          if (p.deactivate) {
            p.deactivate();
          }
        }
      });
    }
    if (command && command.execute) {
      command.execute();
    }
  }
}
