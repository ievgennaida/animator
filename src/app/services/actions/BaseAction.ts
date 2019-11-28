export abstract class BaseAction {
  abstract do();
  abstract undo();
  canUndo(): boolean {
    return true;
  }

  canDo(): boolean {
    return true;
  }
}
