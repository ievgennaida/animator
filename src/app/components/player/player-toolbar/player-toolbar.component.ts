import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  ChangeDetectionStrategy,
} from "@angular/core";
import { ZoomTool } from "src/app/services/viewport/zoom.tool";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { ToolsService } from "src/app/services/viewport/tools.service";
import { PanTool } from "src/app/services/viewport/pan.tool";
import { ViewService } from "src/app/services/view.service";
import { GridLinesRenderer } from 'src/app/services/viewport/renderers/grid-lines.renderer';

@Component({
  selector: "app-player-toolbar",
  templateUrl: "./player-toolbar.component.html",
  styleUrls: ["./player-toolbar.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerToolbarComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject();
  showGridLines = this.gridLinesRenderer.showGridLines();

  constructor(
    private viewService: ViewService,
    private zoomTool: ZoomTool,
    private cdRef: ChangeDetectorRef,
    private toolsService: ToolsService,
    private panTool: PanTool,
    private gridLinesRenderer: GridLinesRenderer
  ) {}

  scrollbarInputValue = "100";

  ngOnInit(): void {
    this.gridLinesRenderer.showGridLinesSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((gridLines) => {
        if (gridLines !== this.showGridLines) {
          this.showGridLines = gridLines;
          this.cdRef.markForCheck();
        }
      });

    this.viewService.transformed
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        const value = String((this.viewService.getZoom() * 100).toFixed(2));
        if (value !== this.scrollbarInputValue) {
          this.scrollbarInputValue = value;
          this.cdRef.markForCheck();
        }
      });
  }

  toogleGridLines() {
    this.gridLinesRenderer.toogleShowGridLines();
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

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
