import { Subject } from "rxjs";

export enum CommandType {
  Command = "command",
  Label = "label",
  Separator = "separator",
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
