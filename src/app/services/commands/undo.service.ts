import { Injectable } from "@angular/core";
import { BaseActionCommand } from "./base-action-command";

@Injectable({
  providedIn: "root"
})
export class UndoService {
  constructor() {}

  actions: BaseActionCommand[] = [];
  activeIndex = 0;

  addAction(action: BaseActionCommand) {
    this.actions.push(action);
    this.activeIndex = this.actions.length - 1;
  }

  canUndo() {
    const nextAction = this.activeIndex - 1;
    if (nextAction >= 0 && nextAction < nextAction) {
      return this.actions[nextAction].canUndo();
    }

    return false;
  }

  undo() {
    if (!this.canUndo()) {
      return;
    }

    this.activeIndex--;
    const nextAction = this.actions[this.activeIndex];
    nextAction.undo();
  }

  canRedo() {
    const nextAction = this.activeIndex + 1;
    if (nextAction >= 0 && nextAction < nextAction) {
      return this.actions[nextAction].canDo();
    }

    return false;
  }

  redo() {
    if (!this.canRedo()) {
      return;
    }

    this.activeIndex++;
    const nextAction = this.actions[this.activeIndex];
    nextAction.do();
  }
}
