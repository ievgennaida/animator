import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { TreeNode } from "src/app/models/tree-node";
import { BaseCommand } from "src/app/services/commands/base-command";
import { LoggerService } from "../logger.service";
import { PasteService } from "../paste.service";
import { SelectionService } from "../selection.service";
import { UndoService } from "../undo.service";
import { RemoveElementCommand } from "./remove-element-command";

/**
 * Cut command based on the remove command. But items are copied to the buffer before.
 */
@Injectable({
  providedIn: "root",
})
export class CutCommand extends RemoveElementCommand implements BaseCommand {
  nodes: TreeNode[];
  indexes: number[];
  changed: Subject<BaseCommand>;

  title = "Cut";
  icon = "content_cut";
  hotkey = "Ctrl+X";
  tooltip = `Cut selected items (${this.hotkey})`;
  iconSVG = false;
  constructor(
    selectionService: SelectionService,
    undoService: UndoService,
    logger: LoggerService,
    private clipboardService: PasteService
  ) {
    super(selectionService, undoService, logger);
  }
  canExecute(): boolean {
    return super.canExecute();
  }
  execute(): void {
    const selectedNodes = this.selectionService.getTopSelectedNodes();
    this.clipboardService.addToBuffer(selectedNodes);
    // Execute remove command:
    super.execute();
  }
}
