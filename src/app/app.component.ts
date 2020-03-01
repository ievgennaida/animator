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
import { UndoService } from "./services/actions/undo.service";
import { ToolsService } from "./services/viewport/tools.service";
import { ViewportService } from "./services/viewport/viewport.service";
import { InputDocument, InputDocumentType } from "./models/input-document";
import { LoggerService } from "./services/logger.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  title = "animation";
  outlineW: number | string = null;
  footerH: number | string = null;
  recentItems = [];
  lastUsedPropertiesW = 0;
  undoDisabled = false;
  redoDisabled = false;
  constructor(
    private ngZone: NgZone,
    private undoService: UndoService,
    private stateService: DocumentService,
    private self: ElementRef,
    private viewportService: ViewportService,
    private toolsService: ToolsService,
    private logger: LoggerService,
    private cdRef: ChangeDetectorRef
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

  redo() {
    this.undoService.redo();
  }

  undo() {
    this.undoService.undo();
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

    this.stateService.document.subscribe(p => {
      if (p) {
        this.title = p.title;
      } else {
        this.title = "";
      }

      this.cdRef.markForCheck();
    });

    this.setRecent(null);
  }

  loadData(data, title: string) {
    title = title || "";

    let parsed: InputDocument = null;
    try {
      const lower = title.toLowerCase();
      if (lower.endsWith("svg")) {
        const parser = new DOMParser();
        const document = parser.parseFromString(data, "image/svg+xml");
        parsed = new InputDocument();
        parsed.data = data;
        parsed.title = title;
        parsed.parsedData = document;
        parsed.type = InputDocumentType.SVG;
      } else if (lower.endsWith("json")) {
        const parsedJson = JSON.parse(data);
        parsed = new InputDocument();
        parsed.data = data;
        parsed.title = title;
        parsed.parsedData = parsedJson;
        parsed.type = InputDocumentType.JSON;
      }
    } catch (err) {
      // TODO: popup
      const message = `file '${title}' cannot be parsed`;
      alert(message);
      this.logger.log(message);
    }

    if (parsed) {
      this.stateService.setDocument(parsed, title);
      const newData = {
        name: title,
        str: data
      };
      this.setRecent(newData);
    }
  }

  toogleProperties() {
    this.out(()=>{
      const style = this.properties.nativeElement.style;
      if (style.width && style.width !== "0px") {
        this.lastUsedPropertiesW = style.width;
        style.width = "0px";
      } else {
        style.width = this.lastUsedPropertiesW;
      }

      this.viewportService.emitViewportResized();
    })
  }

  setRecent(newRecentItem: any) {
    const stored = localStorage.getItem("recent");
    let parsed = null;

    if (stored) {
      parsed = JSON.parse(stored);
    }

    if (!Array.isArray(parsed)) {
      parsed = [];
    }

    this.recentItems = parsed;

    if (newRecentItem) {
      let index = this.recentItems.indexOf(
        this.recentItems.find(p => p.name === newRecentItem.name)
      );

      if (index >= 0 || this.recentItems.length > consts.recentItemsCount) {
        if (index <= 0) {
          index = 0;
        }

        this.recentItems.splice(index, 1);
      }

      this.recentItems.push(newRecentItem);
      localStorage.setItem("recent", JSON.stringify(this.recentItems));
    }
  }

  fileSelected(event) {
    const files = event.target.files;
    if (!files || event.target.files.length === 0) {
      return;
    }

    const file: File = files[0];
    const fileReader = new FileReader();
    fileReader.onload = () => {
      try {
        const str = fileReader.result.toString();
        this.loadData(str, file.name);
      } catch (err) {
        alert(`File ${file.name} cannot be parsed!`);
        console.log(err);
      }
    };

    fileReader.readAsText(file);

    // after here 'file' can be accessed and used for further process
  }
}
