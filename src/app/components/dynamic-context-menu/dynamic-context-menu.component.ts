import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatMenu } from "@angular/material/menu";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { BaseCommand } from "src/app/services/commands/base-command";
import { CommandsExecutorService } from "src/app/services/commands/commands-services/commands-executor-service";
import { BaseComponent } from "../base-component";

@Component({
  selector: "app-dynamic-context-menu",
  templateUrl: "./dynamic-context-menu.component.html",
  styleUrls: ["./dynamic-context-menu.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicContextMenuComponent
  extends BaseComponent
  implements OnInit {
  @ViewChild("matMenu") public matMenu: MatMenu;

  public commands: BaseCommand[] | null = [];
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input("commands") set setCommand(commands: BaseCommand[]) {
    this.subscribeCommands(commands);
  }
  protected commandChanged$ = new Subject<BaseCommand>();

  constructor(
    private commandExecutor: CommandsExecutorService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
  }
  render(): void {
    this.cdRef.markForCheck();
  }
  subscribeCommands(commands: Array<BaseCommand>): void {
    // Notify to unsubscribe current subscribed list if any:
    this.commandChanged$.next();

    this.commands = commands;
    if (this.commands) {
      this.commands.forEach((p) => {
        if (p && p.changed) {
          p.changed
            .asObservable()
            // destroy on commands list changed or when component is unloaded:
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

  ngOnInit(): void {}

  onActionClicked(event: MouseEvent, command: BaseCommand): void {
    // Run in a next tick, allow for menu to be responsive.
    this.commandExecutor.executeCommand(command, true, () => this.render());
  }
}
