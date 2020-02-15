import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from "@angular/core";

import { Subject } from "rxjs";
import { PlayerService } from "src/app/services/player.service";
import { ToolsService } from "src/app/services/viewport/tools.service";
import { PanTool } from "src/app/services/viewport/pan.tool";
import { BaseSelectionTool } from "src/app/services/viewport/base-selection.tool";
import { ViewportService } from "src/app/services/viewport/viewport.service";
import { ScrollbarsPanTool } from "src/app/services/viewport/scrollbars-pan.tool";
import { ZoomTool } from "src/app/services/viewport/zoom.tool";
import { CanvasAdornersRenderer } from "src/app/services/viewport/renderers/canvas-adorners.renderer";

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
    private selectionTool: BaseSelectionTool,
    private cdRef: ChangeDetectorRef,
    private scrollbarsPanTool: ScrollbarsPanTool,
    private adornersRenderer: CanvasAdornersRenderer
  ) {}
  workAreaSize = this.viewportService.viewportSizeSubject.getValue();
  shadowAreaSize = this.workAreaSize;
  scrollbarSize = 17;
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
    this.toolsService.onViewportTouchStart(event);
  }
  onViewportTouchEnd(event: TouchEvent) {
    this.toolsService.onViewportTouchEnd(event);
  }
  onViewportTouchMove(event: TouchEvent) {
    this.toolsService.onViewportTouchMove(event);
  }
  onViewportTouchLeave(event: TouchEvent) {
    this.toolsService.onViewportTouchLeave(event);
  }
  onViewportTouchCancel(event: TouchEvent) {
    this.toolsService.onViewportTouchCancel(event);
  }
  onViewportMouseLeave(event: MouseEvent) {
    this.toolsService.onViewportMouseLeave(event);
  }
  onViewportMouseDown(event: MouseEvent) {
    this.toolsService.onViewportMouseDown(event);
  }
  onViewportMouseUp(event: MouseEvent) {
    this.toolsService.onViewportMouseUp(event);
  }
  onViewportMouseWheel(event: WheelEvent) {
    this.toolsService.onViewportMouseWheel(event);
  }
  onViewportBlur(event: Event) {
    this.toolsService.onViewportBlur(event);
  }

  centerViewport() {
    this.panTool.fit();
  }

  fitViewport() {
    this.toolsService.fitViewport();
  }

  ngOnInit() {
    this.calcRealScrollBarSize();

    this.viewportService.init(this.svgViewPortRef.nativeElement, this.playerRef.nativeElement);
    this.scrollbarsPanTool.init(
      this.scrollBarsRef.nativeElement,
      this.scrollContentRef.nativeElement
    );

    this.viewportService.viewportSizeSubject.subscribe(p => {
      this.workAreaSize = p;
      // TODO: offsets
      this.shadowAreaSize = this.workAreaSize;
      // Check whether required.
      this.cdRef.markForCheck();
    });

    this.zoomTool.init(this.selectionRectangleAdornerRef.nativeElement);
    this.selectionTool.init(this.selectionRectangleAdornerRef.nativeElement);
    this.toolsService.fitViewport();

    this.viewportService.viewportTransformationSubject
      .asObservable()
      .subscribe(p => {
        let value = "";
        if (p) {
          value = String((p.a * 100).toFixed(2));
        }

        if (value !== this.scrollbarInputValue) {
          this.scrollbarInputValue = value;
          this.cdRef.markForCheck();
        }
      });

    this.adornersRenderer.init(
      this.canvasAdornersRef.nativeElement,
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

  toogleGridLines() {}

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
