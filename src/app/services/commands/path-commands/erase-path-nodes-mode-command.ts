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
export class ErasePathNodesModeCommand extends BasePathNodesCommand {
  constructor(
    undoService: UndoService,
    pathDirectSelectionTool: PathDirectSelectionTool
  ) {
    super(pathDirectSelectionTool, undoService);
  }
  expectedMode = PathDirectSelectionToolMode.Erase;
  title = "Remove Path Nodes";
  tooltip = `Remove Path Nodes`;
  icon = "erase";
  iconSVG = true;
}
