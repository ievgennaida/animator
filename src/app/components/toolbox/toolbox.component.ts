import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from "@angular/core";
import { ToolsService } from "src/app/services/viewport/tools.service";
import { BaseTool } from "src/app/services/viewport/base.tool";

import { takeUntil } from "rxjs/operators";
import { BaseComponent } from "../base-component";

@Component({
  selector: "app-toolbox",
  templateUrl: "./toolbox.component.html",
  styleUrls: ["./toolbox.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolboxComponent extends BaseComponent implements OnInit {
  constructor(
    private toolsService: ToolsService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    this.cdRef.detach();
  }

  tools: Array<BaseTool> = [];
  activeTool: BaseTool = null;
  ngOnInit() {
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

  onToolSelected(activeTool: BaseTool) {
    this.toolsService.setActiveTool(activeTool);
  }
}
