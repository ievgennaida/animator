import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from "@angular/core";
import { ToolsService } from "src/app/services/viewport/tools.service";
import { PanTool } from "src/app/services/viewport/pan.tool";
import { ZoomTool } from "src/app/services/viewport/zoom.tool";
import { BaseTool } from "src/app/services/viewport/base.tool";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-toolbox",
  templateUrl: "./toolbox.component.html",
  styleUrls: ["./toolbox.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolboxComponent implements OnInit, OnDestroy {
  constructor(
    private toolsService: ToolsService,
    private cd: ChangeDetectorRef
  ) {}
  private destroyed$ = new Subject();
  tools: Array<BaseTool> = [];
  activeTool: BaseTool = null;
  ngOnInit() {
    this.tools = this.toolsService.tools;
    this.activeTool = this.toolsService.getActiveTool();
    this.toolsService
      .activeToolChanged()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(tool => {
        this.activeTool = tool;
        this.cd.markForCheck();
      });
  }

  onToolSelected(activeTool: BaseTool) {
    this.toolsService.setActiveTool(activeTool);
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
