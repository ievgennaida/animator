import { BaseCommand, CommandType } from "./base-command";

/**
 * Fake command used just to display some text
 */
export class LabelCommand implements BaseCommand {
  commandType?: CommandType | string = CommandType.label;
  constructor(public title) {}
  canExecute(): boolean {
    return false;
  }
  execute(): void {}
}
