import {
  OnInit,
  Component,
  HostListener,
  ElementRef,
  ViewChild,
  NgZone,
  ChangeDetectorRef,
} from "@angular/core";
import { ResizeEvent } from "angular-resizable-element";
import { consts } from "src/environments/consts";
import { ToolsService } from "./services/tools/tools.service";
import { ViewService } from "./services/view.service";
import { HotkeysService } from "./services/hotkeys.service";
import { WireService } from "./services/wire.service";
import { ViewMode } from "src/app/models/view-mode";
import { ContextMenuService } from "./services/context-menu.service";
import { AssetsService } from "./services/assets.service";
import { Utils } from "./services/utils/utils";
import { BaseComponent } from "./components/base-component";
import { takeUntil } from "rxjs/operators";
import { MouseEventArgs } from "./models/mouse-event-args";

// Panels min and max size from the nominal value.
const MIN_PERCENT = 0.1;
const MAX_PERCENT = 0.9;
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent extends BaseComponent implements OnInit {
  @ViewChild("footer", { static: true, read: ElementRef })
  footer: ElementRef | null = null;

  @ViewChild("outline", { read: ElementRef })
  outline: ElementRef<HTMLElement> | null = null;

  @ViewChild("menu", { static: true, read: ElementRef })
  menu: ElementRef | null = null;

  @ViewChild("player", { static: true, read: ElementRef })
  player: ElementRef | null = null;

  @ViewChild("drawerContent", { static: true })
  drawerContent: ElementRef | null = null;
  outlineW: number | string | null = null;
  footerH: number | string | null = null;
  lastMenuW = 0;
  mode: ViewMode = consts.appearance.defaultMode;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ViewMode = ViewMode;
  menuVisible = this.viewService.menuVisibleSubject.getValue();
  codeVisible = this.viewService.codeVisibleSubject.getValue();
  breadcrumbsVisible = this.viewService.breadcrumbsVisibleSubject.getValue();

  prevMouseUpArgs: MouseEventArgs | null = null;

  constructor(
    private ngZone: NgZone,
    private cdRef: ChangeDetectorRef,
    private self: ElementRef,
    private viewService: ViewService,
    private toolsService: ToolsService,
    private hotkeys: HotkeysService,
    private contextMenuService: ContextMenuService,
    assetsService: AssetsService,
    wire: WireService
  ) {
    super();
    assetsService.registerIcons();
    wire.init();
  }
  @HostListener("window:resize", [])
  onWindowResize() {
    if (this.outline && this.outline.nativeElement) {
      // Set the scroll into the bounds:
      const w = this.self.nativeElement.clientWidth;
      this.outlineW = Utils.keepInBounds(
        this.outline.nativeElement.clientWidth,
        w * MIN_PERCENT,
        w * MAX_PERCENT
      );
    }

    this.out(() => {
      this.viewService.emitViewportResized();
    });
  }

  @HostListener("window:mousedown", ["$event"])
  onWindowMouseDown(event: MouseEvent) {
    const handled = this.contextMenuService.onWindowMouseDown(event);
    if (!handled) {
      this.out(() => {
        this.toolsService.onWindowMouseDown(event);
      });
    }
  }

  @HostListener("window:mouseup", ["$event"])
  onWindowMouseUp(event: MouseEvent) {
    this.out(() => {
      const mouseEventsArgs = new MouseEventArgs(event);
      mouseEventsArgs.isDoubleClick = MouseEventArgs.getIsDoubleClick(
        mouseEventsArgs,
        this.prevMouseUpArgs
      );
      try {
        this.toolsService.onWindowMouseUp(mouseEventsArgs);
      } finally {
        this.prevMouseUpArgs = mouseEventsArgs;
      }
    });
  }

  @HostListener("window:blur", ["$event"])
  onWindowBlur(event: Event) {
    this.out(() => {
      this.toolsService.onWindowBlur(event);
    });
  }

  onResizeOutline(event: ResizeEvent): void {
    if (!event.rectangle.width) {
      return;
    }
    const w = this.self.nativeElement.clientWidth;
    this.outlineW = Utils.keepInBounds(
      event.rectangle.width,
      w * MIN_PERCENT,
      w * MAX_PERCENT
    );
    this.viewService.emitViewportResized();
  }

  onResizeFooter(event: ResizeEvent): void {
    if (!event.rectangle.height) {
      return;
    }
    const h = this.self.nativeElement.clientHeight;
    this.footerH = Utils.keepInBounds(
      event.rectangle.height,
      h * MIN_PERCENT,
      h * MAX_PERCENT
    );
    this.viewService.emitViewportResized();
  }

  onWindowMouseWheel(event: WheelEvent) {
    if (this.contextMenuService.isOpened()) {
      this.contextMenuService.close();
    }
    // Method is used because HostListener doesn't have
    // 'passive' option support.
    this.out(() => {
      this.toolsService.onWindowMouseWheel(event);
    });
  }

  out<T>(fn: (...args: any[]) => T): T {
    return this.ngZone.runOutsideAngular(fn);
  }

  monitorElementSize(element: HTMLElement, callback: () => void) {
    let lastWidth = element.clientWidth;
    let lastHeight = element.clientHeight;

    setInterval(() => {
      if (
        lastWidth !== element.clientWidth ||
        lastHeight !== element.clientHeight
      ) {
        lastWidth = element.clientWidth;
        lastHeight = element.clientHeight;
        if (callback) {
          callback();
        }
      }
    }, 100);

    return element;
  }

  ngOnInit(): void {
    window.addEventListener(
      "resize",
      (event: Event) => {
        this.toolsService.onWindowKeyDown(event as KeyboardEvent);
      },
      false
    );

    this.out(() => {
      this.monitorElementSize(this.player?.nativeElement, () => {
        this.viewService.emitViewportResized();
      });
      window.addEventListener(
        "keydown",
        (event: KeyboardEvent) => {
          this.toolsService.onWindowKeyDown(event);
        },
        false
      );
      window.addEventListener(
        "keyup",
        (event: KeyboardEvent) => {
          console.log(`Key up: ${event.key}`);
          this.toolsService.onWindowKeyUp(event);
        },
        false
      );

      document.addEventListener(
        "mousemove",
        (event: MouseEvent) => {
          this.toolsService.onWindowMouseMove(event);
        },
        false
      );

      document.addEventListener(
        "visibilitychange",
        (event) => {
          if (document.hidden) {
            this.toolsService.onWindowBlur(event);
          }
        },
        false
      );

      window.addEventListener(
        "wheel",
        (e) => {
          this.onWindowMouseWheel(e);
        },
        {
          passive: false,
        }
      );
    });

    this.viewService.menuVisibleSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((visible) => {
        this.menuVisible = visible;
        this.viewService.emitViewportResized();
      });
    this.viewService.viewModeSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((mode) => {
        if (this.mode !== mode) {
          this.mode = mode;
        }
      });

    this.hotkeys.initialize();
    this.viewService.codeVisibleSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((visible) => {
        if (this.codeVisible !== visible) {
          this.codeVisible = visible;
          this.cdRef.markForCheck();
        }
      });

    this.viewService.breadcrumbsVisibleSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((visible) => {
        if (this.breadcrumbsVisible !== visible) {
          this.breadcrumbsVisible = visible;
          this.cdRef.markForCheck();
        }
      });
  }
}
