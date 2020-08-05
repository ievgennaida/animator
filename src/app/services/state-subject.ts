import { BehaviorSubject } from "rxjs";
import { Utils } from "src/app/services/utils/utils";
/**
 * Change State mode.
 */
export enum ChangeStateMode {
  /**
   * Select new items. deselect changed.
   */
  Normal = 1,
  /**
   * Append current selection.
   */
  Append = 2,
  /**
   * Revert selected items state.
   */
  Revert = 3,
  /**
   * Remove
   */
  Remove = 4,
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

  protected equals(first: T, second: T) {
    return first === second;
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
  public getValues(): Array<T> {
    const state = this.getValue();
    return state ? state.values || [] : [];
  }
  public setNone() {
    this.change([], ChangeStateMode.Normal);
  }
  public change(
    values: T[] | T,
    mode: ChangeStateMode = ChangeStateMode.Normal
  ): boolean {
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
        if (!state.values.find((p) => this.equals(p, node))) {
          const changed = this.changeState(state, node, true);
          if (changed) {
            state.values.push(node);
          }
        }
      });
    } else if (converted && mode === ChangeStateMode.Remove) {
      converted.forEach((node) => {
        const foundEqualItem = state.values.find((p) => this.equals(p, node));
        if (foundEqualItem) {
          this.changeState(state, node, false);
          Utils.deleteElement<T>(state.values, foundEqualItem);
        }
      });
    } else if (converted && mode === ChangeStateMode.Revert) {
      converted.forEach((node) => {
        const foundEqualItem = state.values.find((p) => this.equals(p, node));
        if (foundEqualItem) {
          this.changeState(state, node, false);
          Utils.deleteElement<T>(state.values, foundEqualItem);
        } else {
          this.changeState(state, node, true);
          state.values.push(node);
        }
      });
    } else if (mode === ChangeStateMode.Normal) {
      if (converted) {
        converted.forEach((node) => {
          if (!state.values.find((p) => this.equals(p, node))) {
            this.changeState(state, node, true);
          }
        });
      }

      state.values.forEach((node) => {
        const exists = converted.find((p) => this.equals(p, node));
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
      return true;
    }

    return false;
  }
}
