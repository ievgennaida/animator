import { Injectable } from "@angular/core";
import { BaseTool } from "./base.tool";
import { ViewportService } from "./viewport.service";
import { MouseEventArgs } from "./MouseEventArgs";
import { PanTool } from "./pan.tool";
import { consts } from "src/environments/consts";

@Injectable({
  providedIn: "root"
})
export class ScrollbarsPanTool extends BaseTool {
  constructor(
    private viewportService: ViewportService,
    private panTool: PanTool
  ) {
    super();
  }

  private scrollData: any = {};
  private panChangedProgramatically = false;
  private scrollChangedProgramatically = false;
  private recalcScrollRef = null;
  scrollBarElement: HTMLElement;
  scrollContentElement: HTMLElement;

  onViewportMouseWheel(event: MouseEventArgs) {
    event.preventDefault();

    const whell = event.args as WheelEvent;
    const speed = -event.deltaY * consts.wheelPanSpeed;
    const pan = this.viewportService.getPan();
    if (speed === 0) {
      return;
    }

    if (whell.shiftKey) {
      pan.x += speed;
    } else {
      pan.y += speed;
    }

    this.panTool.pan(pan.x, pan.y);
  }

  public init(
    scrollBarElement: HTMLElement,
    scrollContentElement: HTMLElement
  ) {
    this.scrollBarElement = scrollBarElement;
    this.scrollContentElement = scrollContentElement;
    this.viewportService.viewportTransformationSubject
      .asObservable()
      .subscribe(() => {
        if (this.panChangedProgramatically) {
          this.panChangedProgramatically = false;
          return;
        }

        this.rescaleScrollbars();
      });
    // Initialize after panZoom load
    this.rescaleScrollbars();
  }

  onScroll() {
    if (this.scrollChangedProgramatically) {
      this.scrollChangedProgramatically = false;
      return;
    }

    if (this.recalcScrollRef) {
      clearTimeout(this.recalcScrollRef);
      this.recalcScrollRef = null;
    }

    // Update scrollbars size when scrolling is finished.
    this.recalcScrollRef = setTimeout(function() {
      if (this.recalcScrollRef) {
        clearTimeout(this.recalcScrollRef);
        this.recalcScrollRef = null;
        if (this.panZoom) {
          this.rescaleScrollbars(this.panZoom.getPan());
        }
      }
    }, 1000);

    const x =
      this.scrollData.panX +
      (this.scrollData.scrollLeft - this.scrollBarElement.scrollLeft);

    const y =
      this.scrollData.panY +
      (this.scrollData.scrollTop - this.scrollBarElement.scrollTop);
    this.panChangedProgramatically = true;
    this.panTool.pan(x, y);
  }

  getDistance(x1: number, y1: number): number {
    return Math.abs(x1 - y1);
  }
  rescaleScrollbars() {
    if (!this.viewportService.isInit()) {
      return;
    }

    const svgContentElement = this.viewportService.viewport as SVGElement;
    const viewPortRect = svgContentElement.getBoundingClientRect();

    // TODO: This data should be cached until the browser resize:
    const parentPos = this.viewportService.getContainerClientRect();
    const pan = this.viewportService.getPan();

    const relativePos = {
      width: viewPortRect.width,
      height: viewPortRect.height,
      top: viewPortRect.top - parentPos.top,
      left: viewPortRect.left - parentPos.left
    };
    // Get position relative to a parent:

    const right = relativePos.left + relativePos.width;
    const bottom = relativePos.top + relativePos.height;

    const top = Math.min(relativePos.top, pan.y, 0);
    const left = Math.min(relativePos.left, pan.x, 0);

    // get top and left margins:
    const h = this.getDistance(top, Math.max(bottom, parentPos.height));
    const w = this.getDistance(left, Math.max(right, parentPos.width));

    this.scrollContentElement.style.height = h + "px";
    this.scrollContentElement.style.width = w + "px";

    this.scrollData.panY = pan.y;
    this.scrollData.panX = pan.x;

    // Raw scroll let and top are saved to avoid rounding.
    this.scrollData.scrollLeft = Math.max(0, left * -1);
    this.scrollChangedProgramatically = true;
    this.scrollBarElement.scrollLeft = this.scrollData.scrollLeft;
    this.scrollData.scrollTop = Math.max(0, top * -1);
    this.scrollChangedProgramatically = true;
    this.scrollBarElement.scrollTop = this.scrollData.scrollTop;
  }
}
