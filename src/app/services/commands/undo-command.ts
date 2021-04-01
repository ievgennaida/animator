import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { UndoService } from "../undo.service";

/**
 * Undo command
 */
@Injectable({
  providedIn: "root",
})
export class UndoCommand implements BaseCommand {
  changed = new Subject<BaseCommand>();
  title = "Undo";
  icon = "undo";
  hotkey = "Ctrl+Z";
  tooltip = `Undo Operation (${this.hotkey})`;
  iconSVG = false;
  constructor(private undoService: UndoService) {
    // Command is singleton, no need to unsubscribe.
    this.undoService.actionIndexSubject
      .asObservable()
      .subscribe(() => this.changed.next(this));
  }
  canExecute(): boolean {
    return this.undoService.canUndo();
  }
  execute() {
    if (this.canExecute()) {
      return this.undoService.undo();
    }
  }
}
