import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/services/commands/base-command";
import { BaseTool } from "../viewport/base.tool";
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
import { ViewLayoutAnimatorCommand } from "./view-commands/view-layout-animator-command";
import { ViewLayoutEditorCommand } from "./view-commands/view-layout-editor-command";
import { ToggleMenuVisibilityCommand } from "./view-commands/toggle-menu-visibility-command";
import { ToggleHistoryPanelCommand } from "./view-commands/toggle-history-panel-command";
import { TogglePropertiesPanelCommand } from "./view-commands/toggle-properties-panel-command";
import { ToggleOutlinePanelCommand } from "./view-commands/toggle-outline-panel-command";
import { WireframeCommand } from "./view-commands/wireframe-command";

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
    private viewLayoutAnimatorCommand: ViewLayoutAnimatorCommand,
    private viewLayoutEditorCommand: ViewLayoutEditorCommand,
    private toggleMenuVisibilityCommand: ToggleMenuVisibilityCommand, 
    private toggleHistoryPanelCommand: ToggleHistoryPanelCommand, 
    private togglePropertiesPanelCommand: TogglePropertiesPanelCommand,
    private toggleOutlinePanelCommand: ToggleOutlinePanelCommand,    
    private wireframeCommand: WireframeCommand
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
      this.ungroupCommand
    ];
  }

  getViewMenuCommands(): BaseCommand[] {
    return [
      this.viewLayoutAnimatorCommand,
      this.viewLayoutEditorCommand,
      this.separatorCommand, 
      /*this.viewportGroupCommand,*/
      this.separatorCommand, 
      this.toggleMenuVisibilityCommand,
      this.toggleHistoryPanelCommand,
      this.togglePropertiesPanelCommand,
      this.toggleOutlinePanelCommand,
      this.wireframeCommand
    ];
  }

  getToolCommands(tool: BaseTool): BaseCommand[] {
    if (!tool) {
      return [];
    }
    if (tool instanceof SelectionTool) {
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
      ];
    }
    return [];
  }
}
