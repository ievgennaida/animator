import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/services/commands/base-command";
import { BaseTool } from "../viewport/base.tool";
import { PathDirectSelectionTool } from "../viewport/path-direct-selection.tool";
import { SelectionTool } from "../viewport/selection.tool";
import { BBoxModeCommand } from "./bbox-mode-command";
import { CopyCommand } from "./copy-command";
import { CutCommand } from "./cut-command";
import { GroupCommand } from "./group-commands/group-command";
import { UnGroupCommand } from "./group-commands/ungroup-command";
import { BringToFrontCommand } from "./order-commands/bring-to-front-command";
import { OrderGroupCommand } from "./order-commands/order-group-command";
import { SendToBottomCommand } from "./order-commands/send-to-bottom-command";
import { StepBackwardCommand } from "./order-commands/step-backward-command";
import { StepForwardCommand } from "./order-commands/step-forward-command";
import { PasteCommand } from "./paste-command";
import { RedoCommand } from "./redo-command";
import { RemoveElementCommand } from "./remove-element-command";
import { SelectAllCommand } from "./selection-commands/select-all-command";
import { SelectGroupCommand } from "./selection-commands/select-group-command";
import { SelectNoneCommand } from "./selection-commands/select-none-command";
import { SeparatorCommand } from "./separator-command";
import { UndoCommand } from "./undo-command";
import { UntransformCommand } from "./untransform-command";
import { WireframeCommand } from "./view-commands/wireframe-command";
import { VisibilityCommand } from "./visibility-command";

/**
 * Handle current active tool and services.
 */
@Injectable({
  providedIn: "root",
})
export class CommandsService {
  constructor(
    private bboxRectOnlyCommand: BBoxModeCommand,
    private untransformCommand: UntransformCommand,
    private separatorCommand: SeparatorCommand,
    private undoCommand: UndoCommand,
    private redoCommand: RedoCommand,
    private cutCommand: CutCommand,
    private copyCommand: CopyCommand,
    private pasteCommand: PasteCommand,
    private removeElementCommand: RemoveElementCommand,
    private bringToFrontCommand: BringToFrontCommand,
    private stepForwardCommand: StepForwardCommand,
    private stepBackwardCommand: StepBackwardCommand,
    private sendToBottomCommand: SendToBottomCommand,
    private selectAllCommand: SelectAllCommand,
    private selectNoneCommand: SelectNoneCommand,
    private groupCommand: GroupCommand,
    private ungroupCommand: UnGroupCommand,
    private orderGroupCommand: OrderGroupCommand,
    private selectGroupCommand: SelectGroupCommand,
    private wireframeCommand: WireframeCommand,
    private visibilityCommand: VisibilityCommand
  ) {}

  getContextCommands(): BaseCommand[] {
    return [
      this.separatorCommand,
      this.cutCommand,
      this.copyCommand,
      this.pasteCommand,
      this.removeElementCommand,
      this.separatorCommand,
      this.orderGroupCommand,
      this.selectGroupCommand,
      this.separatorCommand,
      this.groupCommand,
      this.ungroupCommand,
      // TODO: add action first
      // this.untransformCommand,
    ];
  }
  getEditMenuCommands(): BaseCommand[] {
    return [
      this.undoCommand,
      this.redoCommand,
      this.separatorCommand,
      this.cutCommand,
      this.copyCommand,
      this.pasteCommand,
      this.removeElementCommand,
      this.separatorCommand,
      this.orderGroupCommand,
      this.selectGroupCommand,
      this.separatorCommand,
      this.groupCommand,
      this.ungroupCommand,
      // TODO: move to another commands list
      this.wireframeCommand,
    ];
  }

  getToolCommands(tool: BaseTool): BaseCommand[] {
    if (!tool) {
      return [];
    }
    if (tool instanceof PathDirectSelectionTool) {
      return [];
    } else if (tool instanceof SelectionTool) {
      return [
        this.selectAllCommand,
        this.selectNoneCommand,
        this.separatorCommand,
        this.bringToFrontCommand,
        this.stepForwardCommand,
        this.stepBackwardCommand,
        this.sendToBottomCommand,
        this.separatorCommand,
        this.bboxRectOnlyCommand,
        this.visibilityCommand,
      ];
    }
    return [];
  }
}
