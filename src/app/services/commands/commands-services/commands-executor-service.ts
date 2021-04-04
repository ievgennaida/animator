import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/services/commands/base-command";

/**
 * Service used to execute commands
 */
@Injectable({
  providedIn: "root",
})
export class CommandsExecutorService {
  executeCommand(
    command: BaseCommand,
    runInNextTick = false,
    finishedCallback?: (executed: boolean) => void
  ) {
    if (command && command.execute) {
      const execute = () => {
        if (
          command &&
          command.execute &&
          (command.canExecute ? command.canExecute() : true)
        ) {
          command.execute();
          if (finishedCallback) {
            finishedCallback(true);
          }
        }
        if (finishedCallback) {
          finishedCallback(false);
        }
      };

      // Decouple a command execution a bit from a click to allow process menu UI effects.
      if (runInNextTick) {
        setTimeout(() => execute(), 10);
      } else {
        execute();
      }
    } else {
      if (finishedCallback) {
        finishedCallback(false);
      }
    }
  }
}
