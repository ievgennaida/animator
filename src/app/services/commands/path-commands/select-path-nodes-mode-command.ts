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
export class SelectPathNodesModeCommand extends BasePathNodesCommand {
  expectedMode = PathDirectSelectionToolMode.select;
  title = "Select Path Nodes";
  tooltip = `Select and manipulate Path Nodes`;
  icon = "navigation_outline";
  iconSVG = true;
  constructor(
    undoService: UndoService,
    pathDirectSelectionTool: PathDirectSelectionTool
  ) {
    super(pathDirectSelectionTool, undoService);
  }
}
