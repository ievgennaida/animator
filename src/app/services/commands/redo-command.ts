import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { UndoService } from "../undo.service";

/**
 * Redo command
 */
@Injectable({
  providedIn: "root",
})
export class RedoCommand implements BaseCommand {
  constructor(private undoService: UndoService) {
    // Command is singleton, no need to unsubscribe.
    this.undoService.actionIndexSubject
      .asObservable()
      .subscribe(() => this.changed.next(this));
  }
  changed = new Subject<BaseCommand>();
  title = "Redo";
  icon = "redo";
  hotkey = "Ctrl+Y";
  tooltip = `Redo Operation (${this.hotkey})`;
  iconSVG = false;
  canExecute(): boolean {
    return this.undoService.canRedo();
  }
  execute() {
    if (this.canExecute()) {
      return this.undoService.redo();
    }
  }
}
