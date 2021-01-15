import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/services/commands/base-command";
import { BaseTool } from "../../tools/base.tool";
import { PathDirectSelectionTool } from "../../tools/path-direct-selection.tool";
import { SelectionTool } from "../../tools/selection.tool";
import { BBoxModeCommand } from "../bbox-mode-command";
import { BringToFrontCommand } from "../order-commands/bring-to-front-command";
import { SendToBottomCommand } from "../order-commands/send-to-bottom-command";
import { StepBackwardCommand } from "../order-commands/step-backward-command";
import { StepForwardCommand } from "../order-commands/step-forward-command";
import { AddPathNodesCommand } from "../path-commands/add-path-nodes-mode-command";
import { RemovePathNodesCommand } from "../path-commands/remove-path-nodes-command";
import { SmoothNodesCommand } from "../path-commands/smooth-path-nodes-command";
import { SelectAllCommand } from "../selection-commands/select-all-command";
import { SelectNoneCommand } from "../selection-commands/select-none-command";
import { SeparatorCommand } from "../separator-command";
import { VisibilityCommand } from "../visibility-command";

/**
 * Handle current active tool and services.
 */
@Injectable({
  providedIn: "root",
})
export class ToolsCommandsService {
  separator = new SeparatorCommand();
  constructor(
    private bboxRectOnlyCommand: BBoxModeCommand,
    private bringToFrontCommand: BringToFrontCommand,
    private stepForwardCommand: StepForwardCommand,
    private stepBackwardCommand: StepBackwardCommand,
    private sendToBottomCommand: SendToBottomCommand,
    private selectAllCommand: SelectAllCommand,
    private selectNoneCommand: SelectNoneCommand,
    private visibilityCommand: VisibilityCommand,
    private removePathNodesCommand: RemovePathNodesCommand,
    private smoothNodesCommand: SmoothNodesCommand,
    private addPathNodesCommand: AddPathNodesCommand
  ) {}

  getToolCommands(tool: BaseTool): BaseCommand[] {
    if (!tool) {
      return [];
    }
    if (tool instanceof PathDirectSelectionTool) {
      return [
        this.addPathNodesCommand,
        this.removePathNodesCommand,
        this.separator,
        this.smoothNodesCommand,
      ];
    } else if (tool instanceof SelectionTool) {
      return [
        this.selectAllCommand,
        this.selectNoneCommand,
        this.separator,
        this.bringToFrontCommand,
        this.stepForwardCommand,
        this.stepBackwardCommand,
        this.sendToBottomCommand,
        this.separator,
        this.bboxRectOnlyCommand,
        this.visibilityCommand,
      ];
    }
    return [];
  }
}
