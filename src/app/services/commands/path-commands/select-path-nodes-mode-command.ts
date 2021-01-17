import { Injectable } from "@angular/core";
import {
  PathDirectSelectionTool,
  PathDirectSelectionToolMode,
} from "../../tools/path-direct-selection.tool";
import { UndoService } from "../../undo.service";
import { BasePathNodesCommand } from "./base-path-node-mode-command";

/**
 * Change path tool mode to add new nodes.
 */
@Injectable({
  providedIn: "root",
})
export class SelectPathNodesModeCommand extends BasePathNodesCommand {
  constructor(
    undoService: UndoService,
    pathDirectSelectionTool: PathDirectSelectionTool
  ) {
    super(pathDirectSelectionTool, undoService);
  }
  expectedMode = PathDirectSelectionToolMode.Select;
  title = "Select Path Nodes";
  tooltip = `Select and manipulate Path Nodes`;
  icon = "navigation_outline";
  iconSVG = true;
}
