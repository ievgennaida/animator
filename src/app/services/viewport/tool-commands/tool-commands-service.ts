import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/models/base-command";
import { BaseTool } from "../base.tool";
import { SelectionTool } from "../selection.tool";
import { BBoxCommand } from "./bbox-command";
import { BBoxShowTransformedCommand } from './bbox-show-transformed-command';

/**
 * Handle current active tool and services.
 */
@Injectable({
  providedIn: "root",
})
export class ToolCommandsService {
  constructor(
    private bboxRectOnlyCommand: BBoxCommand,
    private bboxTransformed: BBoxShowTransformedCommand
  ) {}

  getCommands(tool: BaseTool): BaseCommand[] {
    if (!tool) {
      return [];
    }
    if (tool instanceof SelectionTool) {
      return [this.bboxRectOnlyCommand, this.bboxTransformed];
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
