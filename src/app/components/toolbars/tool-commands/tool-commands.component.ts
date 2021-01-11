import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { BaseCommand } from "src/app/services/commands/base-command";
import { CommandsService } from "src/app/services/commands/commands-service";
import { ToolsService } from "src/app/services/tools/tools.service";
import { BaseComponent } from "../../base-component";

/**
 * Tool commands list.
 */
@Component({
  selector: "app-tool-commands",
  templateUrl: "./tool-commands.component.html",
  styleUrls: ["./tool-commands.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  ngOnInit() {
    this.commands = this.commandsService.getToolCommands(
      this.toolsService.getActiveTool()
    );
    this.toolsService
      .activeToolChanged()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((tool) => {
        if (tool) {
          this.commands = this.commandsService.getToolCommands(tool);
        }
        this.cdRef.detectChanges();
      });
  }
}
