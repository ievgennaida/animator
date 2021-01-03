import { Subject } from "rxjs";

export function executeCommand(command: BaseCommand): boolean {
  if (command && command.execute && !command.separator && !command.commands) {
    const canExecute = command.canExecute ? command.canExecute() : true;
    if (canExecute) {
      command.execute();
      return true;
    }
  }
  return false;
}

/**
 * Base application command.
 */
export interface BaseCommand {
  tooltip?: string;
  title?: string;
  align?: string;
  /**
   * Icon resource reference.
   */
  icon?: string;
  /**
   * SVG or font icon.
   */
  iconSVG?: boolean;
  active?: boolean;
  group?: string;
  hotkey?: string;
  separator?: boolean;
  commands?: BaseCommand[];
  /**
   * Call to refresh command in the UI.
   * You should manually rise when can execute is changed.
   */
  changed?: Subject<BaseCommand>;
  canExecute?: () => boolean;
  execute?: () => void;
}
