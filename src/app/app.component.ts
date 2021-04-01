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

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent extends BaseComponent implements OnInit {
  @ViewChild("footer", { static: true, read: ElementRef })
  footer: ElementRef;

  @ViewChild("outline", { read: ElementRef })
  outline: ElementRef<HTMLElement>;

  @ViewChild("menu", { static: true, read: ElementRef })
  menu: ElementRef;

  @ViewChild("player", { static: true, read: ElementRef })
  player: ElementRef;

  @ViewChild("drawerContent", { static: true })
  drawerContent: ElementRef;
  outlineW: number | string = null;
  footerH: number | string = null;
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
      this.outlineW = Utils.keepInBounds(
        this.outline.nativeElement.clientWidth,
        this.self.nativeElement.clientWidth
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
    this.outlineW = Utils.keepInBounds(
      event.rectangle.width,
      this.self.nativeElement.clientWidth
    );
    this.viewService.emitViewportResized();
  }

  onResizeFooter(event: ResizeEvent): void {
    this.footerH = Utils.keepInBounds(
      event.rectangle.height,
      this.self.nativeElement.clientHeight
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

  out(callback) {
    this.ngZone.runOutsideAngular(callback);
  }

  monitorElementSize(element: HTMLElement, callback) {
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

  ngOnInit() {
    window.addEventListener(
      "resize",
      (event: KeyboardEvent) => {
        this.toolsService.onWindowKeyDown(event);
      },
      false
    );

    this.out(() => {
      this.monitorElementSize(this.player.nativeElement, () => {
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
