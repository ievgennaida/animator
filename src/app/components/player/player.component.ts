import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { CursorType } from "src/app/models/cursor-type";
import { Flags, TreeNode } from "src/app/models/tree-node";
import { CursorService } from "src/app/services/cursor.service";
import {
  MouseOverMode,
  MouseOverService,
} from "src/app/services/mouse-over.service";
import { OutlineService } from "src/app/services/outline.service";
import { GridLinesRenderer } from "src/app/services/renderers/grid-lines.renderer";
import { PanTool } from "src/app/services/tools/pan.tool";
import { ScrollbarsPanTool } from "src/app/services/tools/scrollbars-pan.tool";
import { ToolsService } from "src/app/services/tools/tools.service";
import { ViewService } from "src/app/services/view.service";
import { BaseComponent } from "../base-component";

@Component({
  selector: "app-player",
  templateUrl: "./player.component.html",
  styleUrls: ["./player.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
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

  @ViewChild("svgViewport", { static: true })
  svgViewPortRef: ElementRef<SVGGraphicsElement>;

  @ViewChild("svg", { static: true })
  svgRef: ElementRef<SVGSVGElement>;

  @ViewChild("resetButton", { static: true })
  resetButton: ElementRef;

  rulerHRef: ElementRef<HTMLCanvasElement>;
  @ViewChild("rulerH", { read: ElementRef })
  set setRulerH(node: ElementRef<HTMLCanvasElement>) {
    if (this.rulerHRef !== node) {
      this.rulerHRef = node;
      this.updateRulers();
    }
  }
  rulerVRef: ElementRef<HTMLCanvasElement>;
  @ViewChild("rulerV", { read: ElementRef })
  set setRulerV(node: ElementRef<HTMLCanvasElement>) {
    if (this.rulerVRef !== node) {
      this.rulerVRef = node;
      this.updateRulers();
    }
  }

  rulerVisible = this.gridLinesRenderer.rulerVisibleSubject.getValue();
  workAreaSize = this.viewService.viewportSizeSubject.getValue();
  shadowAreaSize = this.workAreaSize;
  scrollbarsSize = 17;
  private cachedMouseOver: TreeNode | null = null;
  private readonly defaultBrowserScrollSize = 17;

  constructor(
    private viewService: ViewService,
    private toolsService: ToolsService,
    private panTool: PanTool,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private scrollbarsPanTool: ScrollbarsPanTool,
    private gridLinesRenderer: GridLinesRenderer,
    private outlineService: OutlineService,
    private mouseOverService: MouseOverService,
    private cursor: CursorService
  ) {
    super();
    // this.cdRef.detach();
  }
  calcRealScrollBarSize() {
    const scrollBars = this.scrollBarsRef.nativeElement;
    const offsetElement = this.svgContainer.nativeElement;
    // add the real scrollbars offset size as style.

    const scrollBarWidth = scrollBars.offsetWidth - scrollBars.clientWidth;
    // Change in a case of the non-standard scrollbars width.
    if (scrollBarWidth !== this.defaultBrowserScrollSize) {
      this.scrollbarsSize = scrollBarWidth;
      const sizeStr = scrollBarWidth + "px";
      const sizeWithoutScrollbars = `calc(100% - ${sizeStr})`;
      offsetElement.style.width = sizeWithoutScrollbars;
      offsetElement.style.height = sizeWithoutScrollbars;
    }
  }

  onViewportTouchStart(event: TouchEvent) {
    this.out(() => this.toolsService.onViewportTouchStart(event));
  }
  onViewportTouchEnd(event: TouchEvent) {
    this.out(() => this.toolsService.onViewportTouchEnd(event));
  }
  onViewportMouseMove(event: MouseEvent) {
    this.out(() => this.toolsService.onViewportMouseMove(event));
  }
  onViewportTouchMove(event: TouchEvent) {
    this.out(() => this.toolsService.onViewportMouseMove(event));
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

  onViewportContextMenu(event: MouseEvent) {
    this.out(() => {
      this.toolsService.onViewportContextMenu(event);
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

  /**
   * Track over node event by mouse move args.
   */
  onPlayerMouseOut(event: MouseEvent) {
    if (this.cachedMouseOver && this.cachedMouseOver.tag !== event.target) {
      const node = this.outlineService
        .getAllNodes()
        .find((p) => p.tag === event.target);
      this.mouseOverService.setMouseLeave(node);
    } else {
      this.mouseOverService.setMouseLeave(this.cachedMouseOver);
      this.cachedMouseOver = null;
    }

    this.out(() => {
      this.toolsService.onPlayerMouseOut(event);
    });
  }

  onPlayerMouseOver(event: MouseEvent) {
    try {
      // Mouse over the node
      // Only selectable nodes
      const node = this.outlineService
        .getAllNodes()
        .find((p) => p.tag === event.target);
      if (!node || node.containsFlags(Flags.disableMouseOver)) {
        return;
      }

      this.cachedMouseOver = node;
      this.mouseOverService.setMouseOver(node);
    } finally {
      this.out(() => {
        this.toolsService.onPlayerMouseOver(event);
      });
    }
  }

  out(callback) {
    this.ngZone.runOutsideAngular(callback);
  }

  adjustPan() {
    // TODO: Automatically adjust pan when viewport is resized.
    this.viewService.resized
      .pipe(takeUntil(this.destroyed$))
      .subscribe((size) => {
        if (size && size.prevClientWidth && size.prevClientHeight) {
          const changedW = size.clientWidth - size.prevClientWidth;
          const changedPercentW =
            changedW !== 0 ? changedW / size.clientWidth : 0;
          const changedH = size.clientHeight - size.prevClientHeight;
          const changedPercentH =
            changedH !== 0 ? changedH / size.clientHeight : 0;
          const bounds = this.viewService.getDisplayedBounds();

          if (bounds) {
            const pan = this.panTool.getPan();
            const x = pan.x + bounds.width * changedPercentW;
            const y = pan.y + bounds.height * changedPercentH;
            if (x !== pan.x || y !== pan.y) {
              this.panTool.pan(x, y);
            }
          }
        }
      });
  }

  ngOnInit() {
    this.out(() => {
      this.calcRealScrollBarSize();
      this.cursor.changed
        .pipe(takeUntil(this.destroyed$))
        .subscribe((cursor: CursorType) => {
          const el = this.svgContainer.nativeElement;
          if (el && el.style.cursor !== cursor) {
            el.style.cursor = cursor;
          }
        });

      // this.adjustPan();
    });

    // Mouse over mode.
    this.mouseOverService.mouseOverModeSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((mode) => {
        if (this.playerRef && this.playerRef.nativeElement) {
          const classList = this.playerRef.nativeElement.classList;
          const onlyContainersMode = ".mouse-over-only-containers";
          if (mode === MouseOverMode.containers) {
            classList.remove(onlyContainersMode);
          } else {
            classList.add(onlyContainersMode);
          }
        }
      });

    this.gridLinesRenderer.rulerVisibleSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((visible) => {
        if (this.rulerVisible !== visible) {
          this.rulerVisible = visible;
          this.cdRef.markForCheck();
        }
      });
    this.viewService.init(
      this.svgViewPortRef.nativeElement,
      this.playerRef.nativeElement
    );
    this.scrollbarsPanTool.init(
      this.scrollBarsRef.nativeElement,
      this.scrollContentRef.nativeElement
    );

    this.viewService.viewportSizeSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe((p) => {
        this.workAreaSize = p;
        // TODO: offsets
        this.shadowAreaSize = this.workAreaSize;
        // Check whether required.
        this.cdRef.markForCheck();
      });

    this.toolsService.fitViewport();
    this.updateRulers();
  }

  updateRulers() {
    this.gridLinesRenderer.setRulers(
      this.rulerHRef ? this.rulerHRef.nativeElement : null,
      this.rulerVRef ? this.rulerVRef.nativeElement : null
    );
  }

  onScroll(event: MouseEvent) {
    this.scrollbarsPanTool.onScroll();
    this.out(() => this.toolsService.onScroll());
  }
  fitViewportOrSelected() {
    const fit = this.toolsService.fitViewportToSelected();
    if (!fit) {
      this.toolsService.fitViewport();
    }
  }
  fitViewport() {
    this.toolsService.fitViewport();
  }
}
