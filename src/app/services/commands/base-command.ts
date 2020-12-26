/**
 * Base application command.
 */
export interface BaseCommand {
  tooltip?: string;
  title?: string;
  align?: string;
  icon?: string;
  iconSVG?: boolean;
  active?: boolean;
  group?: string;
  hotkey?: string;
  canExecute?: () => boolean;
  execute: () => void;
  deactivate?: () => void;
}
