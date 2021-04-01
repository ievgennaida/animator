/**
 * Action is a base class for the undo service.
 */
export abstract class BaseAction {
  title?: string;
  tooltip?: string;
  /**
   * Icon resource reference.
   */
  icon?: string;
  /**
   * SVG or font icon.
   */
  iconSVG?: boolean;
  committed = false;

  /**
   * Virtual. Check whether can execute.
   *
   * @returns whether can be executed.
   */
  canExecute(): boolean {
    return this.committed;
  }
  /**
   * Virtual. Check whether can undo.
   *
   * @returns whether can be executed.
   */
  canUndo(): boolean {
    return this.committed;
  }
  abstract execute();
  abstract undo();
}
