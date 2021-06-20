import { Injectable } from "@angular/core";
import { PathDirectSelectionToolMode } from "src/app/models/path-direct-selection-tool-mode";
import { AddPathNodesAction } from "../../actions/path-actions/add-path-nodes-action";
import { SelectionService } from "../../selection.service";
import { PathDirectSelectionTool } from "../../tools/path-direct-selection.tool";
import { UndoService } from "../../undo.service";
import { BasePathNodesCommand } from "./base-path-node-mode-command";

/**
 * Change path tool mode to add new nodes.
 */
@Injectable({
  providedIn: "root",
})
export class AddPathNodesModeCommand extends BasePathNodesCommand {
  expectedMode = PathDirectSelectionToolMode.add;
  title = "Add Path Nodes";
  tooltip = `Add Path Nodes`;
  icon = "add-black-18dp";
  iconSVG = true;
  constructor(
    undoService: UndoService,
    pathDirectSelectionTool: PathDirectSelectionTool,
    private selectionService: SelectionService
  ) {
    super(pathDirectSelectionTool, undoService);
  }
  execute(): void {
    if (!this.canExecute()) {
      return;
    }

    const selectedNodes = this.selectionService.pathDataSubject.getValues();
    const action = this.undoService.getAction(AddPathNodesAction);
    action.init(selectedNodes);
    this.undoService.startAction(action, true);
  }
}
