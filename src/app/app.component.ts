import {
  OnInit,
  Component,
  HostListener,
  ElementRef,
  ViewChild
} from "@angular/core";
import { ResizeEvent } from "angular-resizable-element";
import { StateService } from "./services/state.service";
import { OutlineComponent } from "./components/outline/outline/outline.component";
import { consts } from "src/environments/consts";
import { UndoService } from "./services/actions/undo.service";
import { ToolsService } from './services/viewport-tools/tools.service';
import { ViewportService } from './services/viewport-tools/viewport.service';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  title = "animation";
  outlineW: number | string = null;
  propertiesW: number | string = 215;
  footerH: number | string = null;
  recentItems = [];
  undoDisabled = false;
  redoDisabled = false;
  constructor(
    private undoService: UndoService,
    private stateService: StateService,
    private self: ElementRef,
    private viewportService: ViewportService,
    private toolsService: ToolsService
  ) {}

  @ViewChild("footer", { static: true, read: ElementRef })
  footer: ElementRef;

  @ViewChild("outline", { static: false, read: ElementRef })
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
    this.viewportService.onViewportResized();
  }

  onResizeProperties(event: ResizeEvent): void {
    this.propertiesW = this.resize(
      event.rectangle.width,
      this.self.nativeElement.clientWidth
    );
    this.viewportService.onViewportResized();
  }

  onResizeFooter(event: ResizeEvent): void {
    this.footerH = this.resize(
      event.rectangle.height,
      this.self.nativeElement.clientHeight
    );
    this.viewportService.onViewportResized();
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

    this.propertiesW = this.resize(
      this.properties.nativeElement.clientWidth,
      this.self.nativeElement.clientWidth
    );

    this.viewportService.onViewportResized();
  }

  @HostListener("window:mousedown", ["$event"])
  onWindowMouseDown(event: MouseEvent) {
    this.toolsService.onWindowMouseDown(event);
  }

  @HostListener("window:mousemove", ["$event"])
  onWindowMouseMove(event: MouseEvent) {
    this.toolsService.onWindowMouseMove(event);
  }

  @HostListener("window:mouseup", ["$event"])
  onWindowMouseUp(event: MouseEvent) {
    this.toolsService.onWindowMouseUp(event);
  }

  @HostListener("window:blur", ["$event"])
  onWindowBlur(event: Event) {
    this.toolsService.onWindowBlur(event);
  }

  ngOnInit() {
    this.setRecent(null);
  }

  loadData(item, title: string) {
    const data = JSON.parse(item.str);
    this.stateService.setData(data, title);
    this.setRecent(item);
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
    this.title = file.name;
    const fileReader = new FileReader();
    fileReader.onload = () => {
      try {
        const str = fileReader.result.toString();
        const newData = {
          name: file.name,
          str: str
        };

        this.loadData(newData, this.title);
      } catch (err) {
        alert(`File ${file.name} cannot be parsed!`);
        console.log(err);
      }
    };

    fileReader.readAsText(file);

    // after here 'file' can be accessed and used for further process
  }
}
