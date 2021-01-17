import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/services/commands/base-command";
import { CopyCommand } from "../copy-command";
import { CutCommand } from "../cut-command";
import { GroupCommand } from "../group-commands/group-command";
import { UnGroupCommand } from "../group-commands/ungroup-command";
import { OrderGroupCommand } from "../order-commands/order-group-command";
import { PasteCommand } from "../paste-command";
import { RedoCommand } from "../redo-command";
import { RemoveSelectedCommand } from "../remove-selected-command";
import { SelectGroupCommand } from "../selection-commands/select-group-command";
import { SeparatorCommand } from "../separator-command";
import { UndoCommand } from "../undo-command";
import { WireframeCommand } from "../view-commands/wireframe-command";

/**
 * Handle current active tool and services.
 */
@Injectable({
  providedIn: "root",
})
export class CommandsService {
  separator = new SeparatorCommand();
  constructor(
    private undoCommand: UndoCommand,
    private redoCommand: RedoCommand,
    private cutCommand: CutCommand,
    private copyCommand: CopyCommand,
    private pasteCommand: PasteCommand,
    private removeSelectedCommand: RemoveSelectedCommand,
    private groupCommand: GroupCommand,
    private ungroupCommand: UnGroupCommand,
    private orderGroupCommand: OrderGroupCommand,
    private selectGroupCommand: SelectGroupCommand,
    private wireframeCommand: WireframeCommand
  ) {}
  getEditMenuCommands(): BaseCommand[] {
    return [
      this.undoCommand,
      this.redoCommand,
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
      // TODO: move to another commands list
      this.wireframeCommand,
    ];
  }
}
