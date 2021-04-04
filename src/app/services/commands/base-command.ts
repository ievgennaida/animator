import { Subject } from "rxjs";

export enum CommandType {
  command = "command",
  label = "label",
  separator = "separator",
}
/**
 * Base application command.
 */
export interface BaseCommand {
  tooltip?: string | null;
  title?: string | null;
  align?: string | null;
  /**
   * Icon resource reference.
   */
  icon?: string | null;
  /**
   * SVG or font icon.
   */
  iconSVG?: boolean | null;
  active?: boolean | null;
  group?: string | null;
  hotkey?: string | null;
  commandType?: CommandType | string;
  commands?: BaseCommand[];
  /**
   * Call to refresh command in the UI.
   * You should manually rise when can execute is changed.
   */
  changed?: Subject<BaseCommand>;
  canExecute?: () => boolean;
  execute?: () => void;
}
