import { Injectable } from "@angular/core";
import { PathDirectSelectionToolMode } from "src/app/models/path-direct-selection-tool-mode";
import { SelectionService } from "../../../selection.service";
import { PathDirectSelectionTool } from "../../../tools/path-direct-selection.tool";
import { UndoService } from "../../../undo.service";
import { BasePathNodesCommand } from "./base-path-node-mode-command";

/**
 * Switch path tool mode.
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
}
