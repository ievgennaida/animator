import { Subject } from "rxjs";

/**
 * Base application command.
 */
export interface BaseCommand {
  tooltip?: string;
  title?: string;
  align?: string;
  // Icon resource reference.
  icon?: string;
  // SVG or font icon.
  iconSVG?: boolean;
  active?: boolean;
  group?: string;
  hotkey?: string;
  separator?: boolean;
  commands?: BaseCommand[];
  /**
   * On command changed. ex: can execute, or any of the properties.
   */
  changed?: Subject<BaseCommand>;
  canExecute?: () => boolean;
  execute?: () => void;
}
