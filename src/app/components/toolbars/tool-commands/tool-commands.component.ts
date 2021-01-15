import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { BaseCommand } from "src/app/services/commands/base-command";
import { ToolsCommandsService } from "src/app/services/commands/commands-services/tools-commands-service";
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
    private toolCommandsService: ToolsCommandsService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    this.cdRef.detach();
  }

  commands: BaseCommand[] = [];

  ngOnInit() {
    this.commands = this.toolCommandsService.getToolCommands(
      this.toolsService.getActiveTool()
    );
    this.toolsService
      .activeToolChanged()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((tool) => {
        if (tool) {
          this.commands = this.toolCommandsService.getToolCommands(tool);
        }
        this.cdRef.detectChanges();
      });
  }
}
