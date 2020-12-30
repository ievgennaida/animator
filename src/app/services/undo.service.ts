import { Injectable, Type } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ActionsFactory } from "./actions/actions-factory";
import { BaseAction } from "./actions/base-action";
import { LoggerService } from "./logger.service";
import { Utils } from "./utils/utils";

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
  set actions(value: BaseAction[]) {
    this.actionsSubject.next(value);
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
  getAction<T>(actionType: Type<T>): T {
    const newActionInstance = this.actionsFactory.get<T>(actionType);
    return newActionInstance;
  }
  update() {
    this.actionIndexSubject.next(this.activeIndex);
  }

  /**
   * Remove the action from the history list.
   * Can be used in a case when operation is started but cannot be finished.
   * Ex: move by mouse transaction is started and focus is lost.
   * @param action action to remove.
   */
  remove(action: BaseAction) {
    const indexOf = this.actions.indexOf(action);
    if (indexOf >= 0) {
      // Check that index is not out of the bounds
      if (this.activeIndex >= this.actions.length - 1) {
        this.activeIndex = this.actions.length - 2;
      }
      this.actions = Utils.deleteElement(this.actions, action);
    }
  }
  getActiveAction(): BaseAction | null {
    return this.actions[this.activeIndex];
  }

  getLastAction(): BaseAction | null {
    if (this.actions && this.actions.length > 0) {
      return this.actions[this.actions.length - 1];
    }
    return null;
  }

  /**
   * Perform action and add to the collection.
   */
  startAction(action: BaseAction, execute = true): BaseAction {
    if (this.logger.isDebug()) {
      this.logger.debug(`Start action: ${action.title || typeof action}`);
    }

    const lastAction = this.getLastAction();
    if (lastAction && !lastAction.committed) {
      throw Error(
        `Cannot start new action while current active action is uncommitted ${lastAction.title}`
      );
    }

    if (execute) {
      action.execute();
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

  /**
   * Undo specific action without changing current active index
   */
  _undoAction(action: BaseAction): boolean {
    try {
      if (this.logger.isDebug()) {
        this.logger.debug(
          `Undo: ${action.title} active: (${this.activeIndex}).`
        );
      }

      action.undo();
      return true;
    } catch (er) {
      this.logger.error(
        `Undo Failed: ${action.title} active: (${this.activeIndex})  ${er}.`
      );
    }
    return false;
  }
  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    const nextAction = this.actions[this.activeIndex];

    if (this._undoAction(nextAction)) {
      this.activeIndex--;
      return true;
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
      return this.actions[nextAction].canExecute();
    }

    return false;
  }
  _executeAction(action: BaseAction): boolean {
    if (this.logger.isDebug()) {
      this.logger.log(
        `Redo: (${this.actions.indexOf(action)}) ${action.title}.`
      );
    }
    try {
      action.execute();

      return true;
    } catch (er) {
      this.logger.error(
        `Redo Failed: (${this.activeIndex}) ${action.title} ${er}.`
      );
    }
  }
  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }

    const index = this.activeIndex + 1;
    const nextAction = this.actions[index];
    if (this._executeAction(nextAction)) {
      this.activeIndex = index;
      return true;
    }
    return false;
  }
}
