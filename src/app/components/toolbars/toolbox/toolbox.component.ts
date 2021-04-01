import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { BaseTool } from "src/app/services/tools/base.tool";
import { ToolsService } from "src/app/services/tools/tools.service";
import { BaseComponent } from "../../base-component";

@Component({
  selector: "app-toolbox",
  templateUrl: "./toolbox.component.html",
  styleUrls: ["./toolbox.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolboxComponent extends BaseComponent implements OnInit {
  tools: Array<BaseTool> = [];
  activeTool: BaseTool | null = null;
  constructor(
    private toolsService: ToolsService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    this.cdRef.detach();
  }
  ngOnInit(): void {
    this.tools = this.toolsService.tools;
    this.activeTool = this.toolsService.getActiveTool();
    this.toolsService
      .activeToolChanged()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((tool) => {
        this.activeTool = tool;
        this.cdRef.detectChanges();
      });
  }

  onToolSelected(activeTool: BaseTool): void {
    this.toolsService.setActiveTool(activeTool);
  }
}
