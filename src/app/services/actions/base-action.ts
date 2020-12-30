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
  committed: boolean;
  abstract execute();
  canExecute(): boolean {
    return true;
  }
  abstract undo();
  canUndo(): boolean {
    return true;
  }
}
