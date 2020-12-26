/**
 * Action is a base class for the undo service.
 */
export abstract class BaseAction {
  title?: string;
  tooltip?: string;
  icon?: string;
  abstract do();
  abstract undo();
  canUndo(): boolean {
    return true;
  }

  canDo(): boolean {
    return true;
  }
}
