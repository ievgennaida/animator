import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  ChangeDetectionStrategy,
} from "@angular/core";
import { ZoomTool } from "src/app/services/tools/zoom.tool";
import { takeUntil } from "rxjs/operators";
import { ToolsService } from "src/app/services/tools/tools.service";
import { PanTool } from "src/app/services/tools/pan.tool";
import { ViewService } from "src/app/services/view.service";
import { GridLinesRenderer } from "src/app/services/renderers/grid-lines.renderer";
import { BaseComponent } from '../../base-component';

@Component({
  selector: "app-player-toolbar",
  templateUrl: "./player-toolbar.component.html",
  styleUrls: ["./player-toolbar.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerToolbarComponent extends BaseComponent implements OnInit, OnDestroy {
  showGridLines = this.gridLinesRenderer.gridLinesVisible();
  rulerVisible = this.gridLinesRenderer.rulerVisibleSubject.getValue();
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

  scrollbarsInputValue = "100";

  ngOnInit(): void {
    this.gridLinesRenderer.gridLinesVisibleSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((visible) => {
        if (visible !== this.showGridLines) {
          this.showGridLines = visible;
          this.cdRef.markForCheck();
        }
      });
    this.gridLinesRenderer.rulerVisibleSubject
      .asObservable()
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

  toggleGridLines() {
    this.gridLinesRenderer.toggleShowGridLines();
  }

  setZoomLevel(zoom: any, direction = 0) {
    let newValue = parseFloat(zoom);
    if (isNaN(newValue)) {
      return;
    }

    newValue += direction * 10;
    newValue = newValue / 100;
    this.zoomTool.setDirectZoom(newValue);
    this.centerViewport();
  }
  centerViewport() {
    this.panTool.fit();
  }

  fitViewportSelected() {
    this.toolsService.fitViewportToSelected();
  }

  fitViewport() {
    this.toolsService.fitViewport();
  }
  zoomIn() {
    this.zoomTool.zoomIn();
  }

  zoomOut() {
    this.zoomTool.zoomOut();
  }
}
