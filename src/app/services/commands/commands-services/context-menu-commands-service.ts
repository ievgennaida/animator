import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/services/commands/base-command";
import { CopyCommand } from "../copy-command";
import { CutCommand } from "../cut-command";
import { GroupCommand } from "../group-commands/group-command";
import { UnGroupCommand } from "../group-commands/ungroup-command";
import { OrderGroupCommand } from "../order-commands/order-group-command";
import { PasteCommand } from "../paste-command";
import { RemovePathNodesCommand } from "../path-commands/remove-path-nodes-command";
import { RemoveSelectedCommand } from "../remove-selected-command";
import { SelectGroupCommand } from "../selection-commands/select-group-command";
import { SeparatorCommand } from "../separator-command";

/**
 * Get commands for the context menu
 */
@Injectable({
  providedIn: "root",
})
export class ContextMenuCommandsService {
  separator = new SeparatorCommand();
  constructor(
    private cutCommand: CutCommand,
    private copyCommand: CopyCommand,
    private pasteCommand: PasteCommand,
    private removeSelectedCommand: RemoveSelectedCommand,
    private groupCommand: GroupCommand,
    private ungroupCommand: UnGroupCommand,
    private orderGroupCommand: OrderGroupCommand,
    private selectGroupCommand: SelectGroupCommand,
    private removePathNodesCommand: RemovePathNodesCommand
  ) {}
  getPathDataContextCommands(): BaseCommand[] {
    return [this.removePathNodesCommand];
  }
  getContextCommands(): BaseCommand[] {
    return [
      this.separator,
      this.cutCommand,
      this.copyCommand,
      this.pasteCommand,
      this.removeSelectedCommand,
      this.separator,
      this.orderGroupCommand,
      this.selectGroupCommand,
      this.separator,
      this.groupCommand,
      this.ungroupCommand,
      // TODO: add action first
      // this.untransformCommand,
    ];
  }
}
