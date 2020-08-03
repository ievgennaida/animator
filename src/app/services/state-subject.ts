import { BehaviorSubject } from "rxjs";
import { Utils } from "src/app/services/utils/utils";
/**
 * Change State mode.
 */
export enum ChangeStateMode {
  /**
   * Select new items. deselect changed.
   */
  Normal = "normal",
  /**
   * Append current selection.
   */
  Append = "append",
  /**
   * Revert selected items state.
   */
  Revert = "revert",
}
type StateChangeCallback<T> = (node: T, value: boolean) => boolean;
export class State<T> {
  public values: Array<T> = [];
  public changed: Array<T> = [];
  public added: Array<T> = [];
  public removed: Array<T> = [];
  public any() {
    return this.values && this.values.length > 0;
  }
}
/**
 * State subject allow to track array of the pinned objects and list of the pinned states.
 */
export class StateSubject<T> extends BehaviorSubject<State<T>> {
  constructor(private changeStateCallback: StateChangeCallback<T> = null) {
    super(new State<T>());
  }

  getValues(): Array<T> {
    const state = this.getValue();
    return state ? state.values || [] : [];
  }
  protected changeState(state: State<T>, node: T, value: boolean): boolean {
    const isChanged = this.changeStateCallback
      ? this.changeStateCallback(node, value)
      : true;
    if (isChanged) {
      state.changed.push(node);
      if (value) {
        state.added.push(node);
      } else {
        state.removed.push(node);
      }
    }
    return isChanged;
  }

  change(values: T[] | T, mode: ChangeStateMode = ChangeStateMode.Normal) {
    if (!values) {
      values = [];
    }
    if (!Array.isArray(values)) {
      values = [values];
    }

    const converted = values as T[];
    const state = this.getValue();
    // Keep same ref
    state.changed.length = 0;
    state.added.length = 0;
    state.removed.length = 0;

    if (converted && mode === ChangeStateMode.Append) {
      converted.forEach((node) => {
        if (!state.values.includes(node)) {
          const changed = this.changeState(state, node, true);
          if (changed) {
            state.values.push(node);
          }
        }
      });
    } else if (converted && mode === ChangeStateMode.Revert) {
      converted.forEach((node) => {
        if (state.values.includes(node)) {
          this.changeState(state, node, false);
          Utils.deleteElement<T>(state.values, node);
        } else {
          this.changeState(state, node, true);
          state.values.push(node);
        }
      });
    } else if (mode === ChangeStateMode.Normal) {
      if (converted) {
        converted.forEach((node) => {
          this.changeState(state, node, true);
        });
      }

      state.values.forEach((node) => {
        const exists = converted.includes(node);
        // change values for old selected nodes (deselect old)
        if (!exists) {
          this.changeState(state, node, false);
        }
      });

      if (state.changed.length > 0) {
        if (converted) {
          state.values = converted;
        } else {
          state.values.length = 0;
        }
      }
    }

    if (state.changed.length > 0) {
      this.next(state);
    }
  }
}
