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
  abstract execute();
  canExecute(): boolean {
    return this.committed;
  }
  abstract undo();
  canUndo(): boolean {
    return this.committed;
  }
}
