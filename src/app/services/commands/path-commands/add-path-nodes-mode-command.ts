import { Injectable } from "@angular/core";
import { PathDirectSelectionToolMode } from "src/app/models/path-direct-selection-tool-mode";
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
  constructor(
    undoService: UndoService,
    pathDirectSelectionTool: PathDirectSelectionTool
  ) {
    super(pathDirectSelectionTool, undoService);
  }
  expectedMode = PathDirectSelectionToolMode.Add;
  title = "Add Path Nodes";
  tooltip = `Add Path Nodes`;
  icon = "add-black-18dp";
  iconSVG = true;
}
