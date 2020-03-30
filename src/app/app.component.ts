import {
  OnInit,
  Component,
  HostListener,
  ElementRef,
  ViewChild,
  NgZone,
  ChangeDetectorRef
} from "@angular/core";
import { ResizeEvent } from "angular-resizable-element";
import { DocumentService } from "./services/document.service";
import { consts } from "src/environments/consts";
import { ToolsService } from "./services/viewport/tools.service";
import { ViewportService } from "./services/viewport/viewport.service";
import { ViewService } from "./services/view.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  outlineW: number | string = null;
  footerH: number | string = null;
  lastUsedPropertiesW = 0;

  constructor(
    private ngZone: NgZone,
    private self: ElementRef,
    private viewportService: ViewportService,
    private toolsService: ToolsService,
    private viewService: ViewService
  ) {}

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
    this.viewportService.emitViewportResized();
  }

  onResizeProperties(event: ResizeEvent): void {
    this.properties.nativeElement.style.width =
      this.resize(event.rectangle.width, this.self.nativeElement.clientWidth) +
      "px";
    this.viewportService.emitViewportResized();
  }

  onResizeFooter(event: ResizeEvent): void {
    this.footerH = this.resize(
      event.rectangle.height,
      this.self.nativeElement.clientHeight
    );
    this.viewportService.emitViewportResized();
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

    const style = this.properties.nativeElement.style;
    if (style.width && style !== "0px") {
      this.properties.nativeElement.style.width =
        this.resize(
          this.properties.nativeElement.clientWidth,
          this.self.nativeElement.clientWidth
        ) + "px";
    }
    this.out(() => {
      this.viewportService.emitViewportResized();
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
      const defaultSize = consts.defaultPropertiesPanelSize;
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
        event => {
          if (document.hidden) {
            this.toolsService.onWindowBlur(event);
          }
        },
        false
      );

      window.addEventListener(
        "wheel",
        e => {
          this.onWindowMouseWheel(e);
        },
        {
          passive: false
        }
      );
    });

    this.viewService.viewPropertiesSubject.asObservable().subscribe(() => {
      const style = this.properties.nativeElement.style;
      if (style.width && style.width !== "0px") {
        this.lastUsedPropertiesW = style.width;
        style.width = "0px";
      } else {
        style.width = this.lastUsedPropertiesW;
      }

      this.viewportService.emitViewportResized();
    });
  }
}
