export abstract class BaseActionCommand {
  abstract do();
  abstract undo();
  canUndo(): boolean {
    return true;
  }

  canDo(): boolean {
    return true;
  }
}
