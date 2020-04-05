import {
  OnInit,
  Component,
  HostListener,
  ElementRef,
  ViewChild,
  NgZone,
} from "@angular/core";
import { ResizeEvent } from "angular-resizable-element";
import { consts } from "src/environments/consts";
import { ToolsService } from "./services/viewport/tools.service";
import { ViewService } from "./services/view.service";
import { HotkeysService } from "./services/hotkeys.service";
import { WireService } from "./services/wire.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  outlineW: number | string = null;
  footerH: number | string = null;
  lastUsedPropertiesW = 0;

  constructor(
    private ngZone: NgZone,
    private self: ElementRef,
    private viewService: ViewService,
    private toolsService: ToolsService,
    private hotkeys: HotkeysService,
    wire: WireService
  ) {
    wire.init();
  }

  @ViewChild("footer", { static: true, read: ElementRef })
  footer: ElementRef;

  @ViewChild("outline", { read: ElementRef })
  outline: ElementRef;

  @ViewChild("properties", { static: true, read: ElementRef })
  properties: ElementRef;

  @ViewChild("main", { static: true, read: ElementRef })
  main: ElementRef;

  @ViewChild("drawerContent", { static: true })
  drawerContent: ElementRef;

  onResizeOutline(event: ResizeEvent): void {
    this.outlineW = this.resize(
      event.rectangle.width,
      this.self.nativeElement.clientWidth
    );
    this.viewService.emitViewportResized();
  }

  onResizeProperties(event: ResizeEvent): void {
    this.properties.nativeElement.style.width =
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

  resize(size, maxSize) {
    const min = maxSize * 0.1;
    const max = maxSize * 0.9;
    if (size <= min) {
      size = min;
    }

    if (size >= max) {
      size = max;
    }

    // let toSet = `${size}px`;
    return size;
  }

  @HostListener("window:resize", [])
  onWindowResize() {
    if (!this.outline || !this.outline.nativeElement) {
      return;
    }

    // Set the scroll into the bounds:
    this.outlineW = this.resize(
      this.outline.nativeElement.clientWidth,
      this.self.nativeElement.clientWidth
    );

    const isVisible = this.viewService.viewPropertiesSubject.getValue();
    if (isVisible) {
      this.properties.nativeElement.style.width =
        this.resize(
          this.properties.nativeElement.clientWidth,
          this.self.nativeElement.clientWidth
        ) + "px";
    }
    this.out(() => {
      this.viewService.emitViewportResized();
    });
  }

  @HostListener("window:mousedown", ["$event"])
  onWindowMouseDown(event: MouseEvent) {
    this.out(() => {
      this.toolsService.onWindowMouseDown(event);
    });
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
    // Method is used becaus HostListener doesnot have
    // 'passive' option support.
    this.out(() => {
      this.toolsService.onWindowMouseWheel(event);
    });
  }

  out(callback) {
    this.ngZone.runOutsideAngular(callback);
  }

  ngOnInit() {
    this.out(() => {
      const defaultSize = consts.appearance.propertiesPanelSize;
      this.properties.nativeElement.style.width = defaultSize;
      this.lastUsedPropertiesW = this.properties.nativeElement.style.width;
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

    this.viewService.viewPropertiesSubject
      .asObservable()
      .subscribe((visible) => {
        const style = this.properties.nativeElement.style;
        if (visible) {
          if (!this.lastUsedPropertiesW) {
            this.lastUsedPropertiesW = style.width;
          }

          style.width = this.lastUsedPropertiesW;
        } else {
          if (style.width !== "0px") {
            this.lastUsedPropertiesW = style.width;
          }
          style.width = "0px";
        }

        this.viewService.emitViewportResized();
      });

    this.hotkeys.initialize();
  }
}
