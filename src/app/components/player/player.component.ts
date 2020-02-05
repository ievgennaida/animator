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

import {
  default as lottie,
  AnimationItem,
  AnimationConfigWithData
} from "node_modules/lottie-web";
import { StateService } from "src/app/services/state.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { PlayerService } from "src/app/services/player.service";
import { PropertiesService } from "src/app/services/properties.service";
import { ToolsService } from "src/app/services/viewport-tools/tools.service";
import { PanTool } from "src/app/services/viewport-tools/pan.tool";
import { BaseSelectionTool } from "src/app/services/viewport-tools/base-selection.tool";
import { ViewportService } from "src/app/services/viewport-tools/viewport.service";
import { ScrollbarsPanTool } from "src/app/services/viewport-tools/scrollbars-pan.tool";
import { consts } from "src/environments/consts";
import { ZoomTool } from 'src/app/services/viewport-tools/zoom.tool';

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
  playerRef: ElementRef<HTMLElement>;

  @ViewChild("scrollContent", { static: true })
  scrollContentRef: ElementRef<HTMLElement>;
  @ViewChild("scrollContainer", { static: true })
  scrollBarsRef: ElementRef<HTMLElement>;
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
  offset = 0;
  workAreaSize = {
    x: this.offset,
    y: this.offset,
    w: consts.defaultWorkArea.width,
    shadowW: consts.defaultWorkArea.width + this.offset * 2,
    shadowH: consts.defaultWorkArea.height + this.offset * 2,
    h: consts.defaultWorkArea.height
  };

  animation: AnimationItem | any = null;

  private destroyed$ = new Subject();
  constructor(
    private propertiesService: PropertiesService,
    private stateService: StateService,
    private playerService: PlayerService,
    private viewportService: ViewportService,
    private toolsService: ToolsService,
    private panTool: PanTool,
    private zoomTool: ZoomTool,
    private selectionTool: BaseSelectionTool,
    private cdRef: ChangeDetectorRef,
    private scrollbarsPanTool: ScrollbarsPanTool
  ) {}

  calcRealScrollBarSize() {
    const scrollBars = this.scrollBarsRef.nativeElement;
    const svgContent = this.svgRef.nativeElement;
    // add the real scrollbar offset size as style.

    const scrollBarWidth = scrollBars.offsetWidth - scrollBars.clientWidth;
    // Change in a case of the non-standart scrollbar width.
    if (scrollBarWidth !== this.defaultBrowserScrollSize) {
      const sizeStr = scrollBarWidth + "px";
      const sizeWithoutScrollbar = `calc(100% - ${sizeStr})`;
      svgContent.style.width = sizeWithoutScrollbar;
      svgContent.style.height = sizeWithoutScrollbar;

      const button = this.resetButton.nativeElement;
      if (button) {
        // Scroll bar buttons
        button.style.width = sizeStr;
        button.style.height = sizeStr;
      }
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

  fitViewport() {
    this.toolsService.fitViewport();
  }

  setWorkAreaSize() {
    this.viewportService.onViewportInit(
      this.svgViewPortRef.nativeElement,
      new DOMRect(
        this.workAreaSize.x,
        this.workAreaSize.y,
        this.workAreaSize.shadowW,
        this.workAreaSize.shadowH
      )
    );
  }

  ngOnInit() {
    this.calcRealScrollBarSize();
    this.setWorkAreaSize();

    this.loadData(null);

    this.stateService.data.pipe(takeUntil(this.destroyed$)).subscribe(p => {
      this.loadData(p);
    });

    this.propertiesService.сhanged
      .pipe(takeUntil(this.destroyed$))
      .subscribe(p => {
        if (this.animation) {
          this.loadData(this.animation.animationData, true);
        }
      });

    this.scrollbarsPanTool.init(
      this.scrollBarsRef.nativeElement,
      this.scrollContentRef.nativeElement
    );

    this.zoomTool.init(this.selectionRectangleAdornerRef.nativeElement);
    this.selectionTool.init(this.selectionRectangleAdornerRef.nativeElement);
    this.toolsService.fitViewport();
  }

  onScroll() {
    this.scrollbarsPanTool.onScroll();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  loadData(data, refresh: boolean = false) {
    if (this.animation) {
      this.animation.destroy();
    }

    if (!data) {
      return;
    }

    this.playerRef.nativeElement.innerHTML = null;
    // Order of this calls is strict due to bugs in external libs!
    this.workAreaSize.x = -this.offset;
    this.workAreaSize.y = -this.offset;
    this.workAreaSize.w = data.w;
    this.workAreaSize.h = data.h;
    this.workAreaSize.shadowW = data.w + this.offset * 2;
    this.workAreaSize.shadowH = data.h + this.offset * 2;

    const animParams = {
      container: this.playerRef.nativeElement,
      renderer: "svg",
      loop: true,
      prerender: true,
      autoplay: false,
      animationData: data
    } as AnimationConfigWithData;

    this.animation = lottie.loadAnimation(animParams);
    this.playerService.setPlayer(this.animation);
    if (!refresh) {
      this.stateService.onDataParsed(this.animation, animParams.animationData);
    }

    this.setWorkAreaSize();

    this.toolsService.fitViewport();
    this.cdRef.markForCheck();
  }
}
