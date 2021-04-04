import { BaseCommand, CommandType } from "./base-command";

/**
 * Fake command Used to render separator in the toolbars.
 */
export class SeparatorCommand implements BaseCommand {
  commandType = CommandType.separator;
  execute(): void {}
}
