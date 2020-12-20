/**
 * Base application command.
 */
export interface BaseCommand {
  tooltip?: string;
  title?: string;
  align?: string;
  icon: string;
  active: boolean;
  group?: string;
  execute: () => void;
  deactivate?: () => void;
}
