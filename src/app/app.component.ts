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
import { ToolsService } from "./services/viewport/tools.service";
import { ViewService } from "./services/view.service";
import { HotkeysService } from "./services/hotkeys.service";
import { WireService } from "./services/wire.service";
import { ViewMode } from "src/environments/view-mode";
import { ContextMenuService } from "./services/context-menu.service";
import { AssetsService } from "./services/assets.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  outlineW: number | string = null;
  footerH: number | string = null;
  lastMenuW = 0;
  mode: ViewMode = consts.appearance.defaultMode;
  ViewMode = ViewMode;
  codeVisible = this.viewService.codeVisibleSubject.getValue();
  breadcrumbsVisible = this.viewService.breadcrumbsVisibleSubject.getValue();
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
    assetsService.registerIcons();
    wire.init();
  }

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

  onResizeOutline(event: ResizeEvent): void {
    this.outlineW = this.resize(
      event.rectangle.width,
      this.self.nativeElement.clientWidth
    );
    this.viewService.emitViewportResized();
  }

  onResizeMenu(event: ResizeEvent): void {
    this.menu.nativeElement.style.width =
      this.resize(event.rectangle.width, this.self.nativeElement.clientWidth) +
      "px";
    this.viewService.emitViewportResized();
  }

  onResizeFooter(event: ResizeEvent): void {
    this.footerH = this.resize(
      event.rectangle.height,
      this.self.nativeElement.clientHeight
    );
    this.viewService.emitViewportResized();
  }

  resize(size: number, maxSize: number): number {
    const min = maxSize * 0.1;
    const max = maxSize * 0.9;
    if (size <= min) {
      size = min;
    }

    if (size >= max) {
      size = max;
    }

    return size;
  }

  @HostListener("window:resize", [])
  onWindowResize() {
    if (this.outline && this.outline.nativeElement) {
      // Set the scroll into the bounds:
      this.outlineW = this.resize(
        this.outline.nativeElement.clientWidth,
        this.self.nativeElement.clientWidth
      );
    }

    const isVisible = this.viewService.menuVisibleSubject.getValue();
    if (isVisible) {
      this.menu.nativeElement.style.width =
        this.resize(
          this.menu.nativeElement.clientWidth,
          this.self.nativeElement.clientWidth
        ) + "px";
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
      this.toolsService.onWindowMouseUp(event);
    });
  }

  @HostListener("window:blur", ["$event"])
  onWindowBlur(event: Event) {
    this.out(() => {
      this.toolsService.onWindowBlur(event);
    });
  }

  onWindowMouseWheel(event: WheelEvent) {
    if (this.contextMenuService.isOpened()) {
      this.contextMenuService.close();
    }
    // Method is used becaus HostListener doesnot have
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
    this.out(() => {
      const defaultSize = consts.appearance.menuPanelSize;
      this.menu.nativeElement.style.width = defaultSize;
      this.lastMenuW = this.menu.nativeElement.style.width;
      this.monitorElementSize(this.player.nativeElement, () => {
        this.viewService.emitViewportResized();
      });
      document.addEventListener(
        "keydown",
        (event: KeyboardEvent) => {
          this.toolsService.onWindowKeyDown(event);
        },
        false
      );
      document.addEventListener(
        "keyup",
        (event: KeyboardEvent) => {
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

    this.viewService.menuVisibleSubject.asObservable().subscribe((visible) => {
      const style = this.menu.nativeElement.style;
      if (visible) {
        if (!this.lastMenuW) {
          this.lastMenuW = style.width;
        }

        style.width = this.lastMenuW;
      } else {
        if (style.width !== "0px") {
          this.lastMenuW = style.width;
        }
        style.width = "0px";
      }

      this.viewService.emitViewportResized();
    });
    this.viewService.viewModeSubject.asObservable().subscribe((mode) => {
      if (this.mode !== mode) {
        this.mode = mode;
      }
    });

    this.hotkeys.initialize();
    this.viewService.codeVisibleSubject.asObservable().subscribe((visible) => {
      if (this.codeVisible !== visible) {
        this.codeVisible = visible;
        this.cdRef.markForCheck();
      }
    });

    this.viewService.breadcrumbsVisibleSubject
      .asObservable()
      .subscribe((visible) => {
        if (this.breadcrumbsVisible !== visible) {
          this.breadcrumbsVisible = visible;
          this.cdRef.markForCheck();
        }
      });
  }
}
