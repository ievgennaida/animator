import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { BaseCommand } from "src/app/services/commands/base-command";
import { CommandsExecutorService } from "src/app/services/commands/commands-services/commands-executor-service";
import { BaseComponent } from "../../base-component";

@Component({
  selector: "app-commands-list",
  templateUrl: "./commands-list.component.html",
  styleUrls: ["./commands-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandsListComponent extends BaseComponent {
  constructor(
    private cdRef: ChangeDetectorRef,
    private commandExecutor: CommandsExecutorService
  ) {
    super();
    this.cdRef.detach();
  }
  public commands: BaseCommand[] | null = [];
  @Input("commands") set setCommand(commands: BaseCommand[]) {
    this.subscribeCommands(commands);
  }
  protected commandChanged$ = new Subject();

  subscribeCommands(commands: BaseCommand[]) {
    // Notify to unsubscribe current subscribed list if any:
    this.commandChanged$.next();

    this.commands = commands;
    if (this.commands) {
      this.commands.forEach((command) => {
        if (command && command.changed) {
          command.changed
            .asObservable()
            .pipe(takeUntil(this.commandChanged$), takeUntil(this.destroyed$))
            .subscribe(() => {
              // Render commands again
              this.render();
            });
        }
      });
    }

    this.render();
  }
  /**
   * Call mark for check or detect changes depends on strategy.
   */
  render() {
    this.cdRef.detectChanges();
  }

  async onActionClicked(command: BaseCommand) {
    this.commandExecutor.executeCommand(command, true, () => this.render());
    this.render();
  }
}
