import { Injectable } from "@angular/core";
import { PathDirectSelectionToolMode } from "src/app/models/path-direct-selection-tool-mode";
import { PathDirectSelectionTool } from "../../../tools/path-direct-selection.tool";
import { UndoService } from "../../../undo.service";
import { BasePathNodesCommand } from "./base-path-node-mode-command";

/**
 * Switch path tool mode.
 */
@Injectable({
  providedIn: "root",
})
export class ErasePathNodesModeCommand extends BasePathNodesCommand {
  expectedMode = PathDirectSelectionToolMode.erase;
  title = "Eraser - Remove Path Nodes";
  tooltip = this.title;
  icon = "erase";
  iconSVG = true;
  constructor(
    undoService: UndoService,
    pathDirectSelectionTool: PathDirectSelectionTool
  ) {
    super(pathDirectSelectionTool, undoService);
  }
}
