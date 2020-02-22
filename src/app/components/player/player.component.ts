import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone
} from "@angular/core";

import { Subject } from "rxjs";
import { PlayerService } from "src/app/services/player.service";
import { ToolsService } from "src/app/services/viewport/tools.service";
import { PanTool } from "src/app/services/viewport/pan.tool";
import { SelectionTool } from "src/app/services/viewport/selection.tool";
import { ViewportService } from "src/app/services/viewport/viewport.service";
import { ScrollbarsPanTool } from "src/app/services/viewport/scrollbars-pan.tool";
import { ZoomTool } from "src/app/services/viewport/zoom.tool";
import { CanvasAdornersRenderer } from "src/app/services/viewport/renderers/canvas-adorners.renderer";
import { CursorService, CursorType } from "src/app/services/cursor.service";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-player",
  templateUrl: "./player.component.html",
  styleUrls: ["./player.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerComponent implements OnInit, OnDestroy {
  @Input("isPlaying")
  get isPaused() {
    return false;
    // return this.animation.isPaused;
  }

  @ViewChild("player", { static: true })
  playerRef: ElementRef<SVGElement>;

  @ViewChild("scrollContent", { static: true })
  scrollContentRef: ElementRef<HTMLElement>;

  @ViewChild("svgContainer", { static: true })
  svgContainer: ElementRef<HTMLElement>;

  @ViewChild("scrollContainer", { static: true })
  scrollBarsRef: ElementRef<HTMLElement>;

  @ViewChild("rulerH", { static: true })
  rulerHRef: ElementRef<HTMLCanvasElement>;

  @ViewChild("rulerW", { static: true })
  rulerWRef: ElementRef<HTMLCanvasElement>;
  @ViewChild("gridLinesAdorner", { static: true })
  gridLinesAdornerRef: ElementRef<HTMLCanvasElement>;

  @ViewChild("canvasAdorners", { static: true })
  canvasAdornersRef: ElementRef<HTMLCanvasElement>;

  @ViewChild("svgViewport", { static: true })
  svgViewPortRef: ElementRef<SVGGraphicsElement>;

  @ViewChild("svg", { static: true })
  svgRef: ElementRef<SVGSVGElement>;

  @ViewChild("resetButton", { static: true })
  resetButton: ElementRef;

  // Some of the adorner are predefined for the performance.
  @ViewChild("selectionRectangleAdorner", { static: true })
  selectionRectangleAdornerRef: ElementRef<HTMLElement>;

  private readonly defaultBrowserScrollSize = 17;

  scrollbarInputValue = "100";

  private destroyed$ = new Subject();
  constructor(
    private viewportService: ViewportService,
    private toolsService: ToolsService,
    private panTool: PanTool,
    private zoomTool: ZoomTool,
    private selectionTool: SelectionTool,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private scrollbarsPanTool: ScrollbarsPanTool,
    private adornersRenderer: CanvasAdornersRenderer,
    private cursor: CursorService
  ) {
    this.cdRef.detach();
  }

  workAreaSize = this.viewportService.viewportSizeSubject.getValue();
  shadowAreaSize = this.workAreaSize;
  scrollbarSize = 17;
  showGridLines = this.adornersRenderer.showGridLinesSubject.getValue();

  calcRealScrollBarSize() {
    const scrollBars = this.scrollBarsRef.nativeElement;
    const offsetElement = this.svgContainer.nativeElement;
    // add the real scrollbar offset size as style.

    const scrollBarWidth = scrollBars.offsetWidth - scrollBars.clientWidth;
    // Change in a case of the non-standart scrollbar width.
    if (scrollBarWidth !== this.defaultBrowserScrollSize) {
      this.scrollbarSize = scrollBarWidth;
      const sizeStr = scrollBarWidth + "px";
      const sizeWithoutScrollbar = `calc(100% - ${sizeStr})`;
      offsetElement.style.width = sizeWithoutScrollbar;
      offsetElement.style.height = sizeWithoutScrollbar;
    }
  }

  onViewportTouchStart(event: TouchEvent) {
    this.out(() => this.toolsService.onViewportTouchStart(event));
  }
  onViewportTouchEnd(event: TouchEvent) {
    this.out(() => this.toolsService.onViewportTouchEnd(event));
  }
  onViewportTouchMove(event: TouchEvent) {
    this.out(() => this.toolsService.onViewportTouchMove(event));
  }
  onViewportTouchLeave(event: TouchEvent) {
    this.out(() => this.toolsService.onViewportTouchLeave(event));
  }
  onViewportTouchCancel(event: TouchEvent) {
    this.out(() => this.toolsService.onViewportTouchCancel(event));
  }
  onViewportMouseLeave(event: MouseEvent) {
    this.out(() => {
      this.toolsService.onViewportMouseLeave(event);
    });
  }
  onViewportMouseDown(event: MouseEvent) {
    this.out(() => {
      this.toolsService.onViewportMouseDown(event);
    });
  }
  onViewportMouseUp(event: MouseEvent) {
    this.out(() => {
      this.toolsService.onViewportMouseUp(event);
    });
  }
  onViewportMouseWheel(event: WheelEvent) {
    this.out(() => {
      this.toolsService.onViewportMouseWheel(event);
    });
  }
  onViewportBlur(event: Event) {
    this.out(() => {
      this.toolsService.onViewportBlur(event);
    });
  }

  onPlayerMouseOut(event: MouseEvent) {
    this.out(() => {
      this.toolsService.onPlayerMouseOut(event);
    });
  }

  onPlayerMouseOver(event: MouseEvent) {
    this.out(() => {
      this.toolsService.onPlayerMouseOver(event);
    });
  }

  out(callback) {
    this.ngZone.runOutsideAngular(callback);
  }
  centerViewport() {
    this.panTool.fit();
  }

  fitViewport() {
    this.toolsService.fitViewport();
  }

  ngOnInit() {
    this.out(() => {
      this.calcRealScrollBarSize();
      this.cursor.сhanged
        .pipe(takeUntil(this.destroyed$))
        .subscribe((cursor: CursorType) => {
          const el = this.svgContainer.nativeElement;
          if (el && el.style.cursor !== cursor) {
            el.style.cursor = cursor;
          }
        });
    });
    this.adornersRenderer.showGridLinesSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(gridLines => {
        if (gridLines !== this.showGridLines) {
          this.showGridLines = gridLines;
          this.cdRef.detectChanges();
        }
      });

    this.viewportService.init(
      this.svgViewPortRef.nativeElement,
      this.playerRef.nativeElement
    );
    this.scrollbarsPanTool.init(
      this.scrollBarsRef.nativeElement,
      this.scrollContentRef.nativeElement
    );

    this.viewportService.viewportSizeSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe(p => {
        this.workAreaSize = p;
        // TODO: offsets
        this.shadowAreaSize = this.workAreaSize;
        // Check whether required.
        this.cdRef.detectChanges();
      });

    this.zoomTool.init(this.selectionRectangleAdornerRef.nativeElement);
    this.selectionTool.init(this.selectionRectangleAdornerRef.nativeElement);
    this.toolsService.fitViewport();

    this.viewportService.viewportTransformationSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(p => {
        let value = "";
        if (p) {
          value = String((p.a * 100).toFixed(2));
        }

        if (value !== this.scrollbarInputValue) {
          this.scrollbarInputValue = value;
          this.cdRef.detectChanges();
        }
      });

    this.adornersRenderer.init(
      this.canvasAdornersRef.nativeElement,
      this.gridLinesAdornerRef.nativeElement,
      this.rulerHRef.nativeElement,
      this.rulerWRef.nativeElement
    );
  }

  onScroll() {
    this.scrollbarsPanTool.onScroll();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  toogleGridLines() {
    this.adornersRenderer.toogleShowGridLines();
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
}
