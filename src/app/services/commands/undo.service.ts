import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { LoggerService } from "../logger.service";
import { ActionsFactory } from "./actions-factory";
import { BaseAction } from "./base-action";

@Injectable({
  providedIn: "root",
})
export class UndoService {
  constructor(
    private actionsFactory: ActionsFactory,
    private logger: LoggerService
  ) {}
  actionsSubject = new BehaviorSubject<BaseAction[]>([]);
  actionIndexSubject = new BehaviorSubject<number>(0);
  get actions(): BaseAction[] {
    return this.actionsSubject.getValue();
  }
  get activeIndex() {
    return this.actionIndexSubject.getValue();
  }
  set activeIndex(value: number) {
    this.actionIndexSubject.next(value);
  }

  /**
   *
   * @param actionType to create action and resolve dependencies.
   */
  getAction<T>(actionType: unknown): T {
    const newActionInstance = this.actionsFactory.get<T>(actionType);
    return newActionInstance;
  }
  commitAction() {}
  /**
   * Perform action and add to the collection.
   */
  startAction(action: BaseAction, execute = true): BaseAction {
    if (execute) {
      action.do();
    }
    this.addAction(action);
    return action;
  }

  clean() {
    this.activeIndex = 0;
    this.actionsSubject.next([]);
  }
  addAction(action: BaseAction) {
    let actions = this.actions;
    if (this.activeIndex < this.actions.length - 1) {
      // Remove old branch and start new actions from the current active location
      actions = this.actions.slice(0, this.activeIndex + 1);
    }

    actions.push(action);
    this.activeIndex = actions.length - 1;
    this.actionsSubject.next(actions);
  }

  canUndo(): boolean {
    const nextAction = this.activeIndex;
    if (nextAction >= 0 && nextAction < this.actions.length) {
      return this.actions[nextAction].canUndo();
    }

    return false;
  }

  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    const nextAction = this.actions[this.activeIndex];
    if (this.logger.isDebug()) {
      this.logger.log(`Undo: (${this.activeIndex}) ${nextAction.title}.`);
    }

    try {
      nextAction.undo();

      this.activeIndex--;
      return true;
    } catch (er) {
      this.logger.error(
        `Undo failed to execute: (${this.activeIndex}) ${nextAction.title} ${er}.`
      );
    }
    return false;
  }

  goToAction(action: BaseAction): boolean {
    const index = this.actions.indexOf(action);
    if (index < 0) {
      return false;
    }
    if (index === this.activeIndex) {
      return false;
    }
    const count = index - this.activeIndex;
    let failed = false;
    for (let i = 0; i < Math.abs(count); i++) {
      let executed = false;
      if (count < 0) {
        executed = this.undo();
      } else {
        executed = this.redo();
      }
      if (!executed) {
        failed = true;
        break;
      }
    }
    this.actionsSubject.next(this.actions);
  }
  canRedo(): boolean {
    const nextAction = this.activeIndex + 1;
    if (nextAction >= 0 && nextAction < this.actions.length) {
      return this.actions[nextAction].canDo();
    }

    return false;
  }

  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }

    const index = this.activeIndex + 1;
    const nextAction = this.actions[index];
    if (this.logger.isDebug()) {
      this.logger.log(`Redo: (${index}) ${nextAction.title}.`);
    }
    try {
      nextAction.do();

      this.activeIndex = index;
      return true;
    } catch (er) {
      this.logger.error(
        `Redo failed to execute: (${this.activeIndex}) ${nextAction.title} ${er}.`
      );
    }
    return;
  }
}
