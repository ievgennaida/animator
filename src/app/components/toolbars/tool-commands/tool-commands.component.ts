import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { BaseCommand } from "src/app/models/base-command";
import { ToolCommandsService } from "src/app/services/viewport/tool-commands/tool-commands-service";
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
    private toolCommands: ToolCommandsService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    // this.cdRef.detach();
  }

  commands: Array<BaseCommand> = [];

  ngOnInit() {
    this.commands = this.toolCommands.getCommands(
      this.toolsService.getActiveTool()
    );
    this.toolsService
      .activeToolChanged()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((tool) => {
        if (tool) {
          this.commands = this.toolCommands.getCommands(tool);
        }
        this.cdRef.markForCheck();
      });
  }
  onActionClicked(tool: BaseCommand) {
    if (tool) {
      this.toolCommands.executeCommand(tool, this.commands);
    }
    // TODO: make a subscription when active commands changed
    this.cdRef.markForCheck();
  }
}
