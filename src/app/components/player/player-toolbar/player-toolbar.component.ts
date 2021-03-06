import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { GridLinesRenderer } from "src/app/services/renderers/grid-lines.renderer";
import { PanTool } from "src/app/services/tools/pan.tool";
import { ToolsService } from "src/app/services/tools/tools.service";
import { ZoomTool } from "src/app/services/tools/zoom.tool";
import { ViewService } from "src/app/services/view.service";
import { BaseComponent } from "../../base-component";

@Component({
  selector: "app-player-toolbar",
  templateUrl: "./player-toolbar.component.html",
  styleUrls: ["./player-toolbar.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerToolbarComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  showGridLines = this.gridLinesRenderer.gridLinesVisible();
  rulerVisible = this.gridLinesRenderer.rulerVisibleSubject.getValue();
  scrollbarsInputValue = "100";
  constructor(
    private viewService: ViewService,
    private zoomTool: ZoomTool,
    private cdRef: ChangeDetectorRef,
    private toolsService: ToolsService,
    private panTool: PanTool,
    private gridLinesRenderer: GridLinesRenderer
  ) {
    super();
  }
  ngOnInit(): void {
    this.gridLinesRenderer.gridLinesVisibleSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe((visible) => {
        if (visible !== this.showGridLines) {
          this.showGridLines = visible;
          this.cdRef.markForCheck();
        }
      });
    this.gridLinesRenderer.rulerVisibleSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe((visible) => {
        if (visible !== this.rulerVisible) {
          this.rulerVisible = visible;
          this.cdRef.markForCheck();
        }
      });
    this.viewService.transformed
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        const value = String((this.viewService.getZoom() * 100).toFixed(2));
        if (value !== this.scrollbarsInputValue) {
          this.scrollbarsInputValue = value;
          this.cdRef.markForCheck();
        }
      });
  }

  toggleGridLines(): void {
    this.gridLinesRenderer.toggleShowGridLines();
  }

  setZoomLevel(zoom: any, direction = 0): void {
    let newValue = parseFloat(zoom);
    if (isNaN(newValue)) {
      return;
    }

    newValue += direction * 10;
    newValue = newValue / 100;
    this.zoomTool.setDirectZoom(newValue);
    this.centerViewport();
  }
  centerViewport(): void {
    this.panTool.fit();
  }

  fitViewportSelected(): void {
    this.toolsService.fitViewportToSelected();
  }

  fitViewport(): void {
    this.toolsService.fitViewport();
  }
  zoomIn(): void {
    this.zoomTool.zoomIn();
  }

  zoomOut(): void {
    this.zoomTool.zoomOut();
  }
}
