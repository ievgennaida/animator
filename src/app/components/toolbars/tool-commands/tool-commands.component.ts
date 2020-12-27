import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { BaseCommand } from "src/app/services/commands/base-command";
import { CommandsService } from "src/app/services/commands/commands-service";
import { ToolsService } from "src/app/services/viewport/tools.service";
import { BaseComponent } from "../../base-component";

/**
 * Tool commands list.
 */
@Component({
  selector: "app-tool-commands",
  templateUrl: "./tool-commands.component.html",
  styleUrls: ["./tool-commands.component.scss"],
})
export class ToolCommandsComponent extends BaseComponent implements OnInit {
  constructor(
    private toolsService: ToolsService,
    private commandsService: CommandsService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    this.cdRef.detach();
  }

  commands: BaseCommand[] = [];

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
              this.cdRef.detectChanges();
            });
        }
      });
    }

    this.cdRef.detectChanges();
  }
  ngOnInit() {
    const commands = this.commandsService.getCommands(
      this.toolsService.getActiveTool()
    );
    this.subscribeCommands(commands);
    this.toolsService
      .activeToolChanged()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((tool) => {
        if (tool) {
          this.subscribeCommands(this.commandsService.getCommands(tool));
        }
        this.cdRef.detectChanges();
      });
  }

  onActionClicked(command: BaseCommand) {
    // Run in a next tick to make interface a bit more responsive.
    setTimeout(() => {
      if (command && !command.commands) {
        this.commandsService.executeCommand(command);
        // TODO: make a subscription when active commands changed
        this.cdRef.markForCheck();
      }
    }, 10);
    this.cdRef.markForCheck();
  }
}
