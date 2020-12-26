/**
 * Action is a base class for the undo service.
 */
export abstract class BaseAction {
  title?: string;
  tooltip?: string;
  icon?: string;
  abstract execute();
  canExecute(): boolean {
    return true;
  }
  abstract undo();
  canUndo(): boolean {
    return true;
  }
}
