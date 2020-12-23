import { HttpClient } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import {
  InputDocument,
  InputDocumentType,
} from "src/app/models/input-document";
import { ViewMode } from "src/app/models/view-mode";
import { UndoService } from "src/app/services/commands/undo.service";
import { DocumentService } from "src/app/services/document.service";
import { LoggerService } from "src/app/services/logger.service";
import { MenuService } from "src/app/services/menu-service";
import { PasteService } from "src/app/services/paste.service";
import { SelectionService } from "src/app/services/selection.service";
import { ViewService } from "src/app/services/view.service";
import { PanTool } from "src/app/services/viewport/pan.tool";
import { GridLinesRenderer } from "src/app/services/viewport/renderers/grid-lines.renderer";
import { ToolsService } from "src/app/services/viewport/tools.service";
import { ZoomTool } from "src/app/services/viewport/zoom.tool";
import { consts, PanelsIds } from "src/environments/consts";
import { BaseComponent } from "../../base-component";
@Component({
  selector: "app-main-toolbar",
  templateUrl: "./main-toolbar.component.html",
  styleUrls: ["./main-toolbar.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainToolbarComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  title = "animation";
  undoDisabled = false;
  redoDisabled = false;
  recentItems = [];
  showGridLines = this.gridLinesRenderer.gridLinesVisible();
  showMenu = this.viewService.menuVisibleSubject.getValue();
  showHistory = this.menuService.isPanelVisible(PanelsIds.History);
  showOutline = this.menuService.isPanelVisible(PanelsIds.Outline);
  showProperties = this.menuService.isPanelVisible(PanelsIds.Properties);
  codeVisible = this.viewService.codeVisibleSubject.getValue();
  breadcrumbsVisible = this.viewService.breadcrumbsVisibleSubject.getValue();
  rulerVisible = this.gridLinesRenderer.rulerVisibleSubject.getValue();

  mode: ViewMode = consts.appearance.defaultMode;
  ViewMode = ViewMode;
  constructor(
    private viewService: ViewService,
    private undoService: UndoService,
    private stateService: DocumentService,
    private logger: LoggerService,
    private cdRef: ChangeDetectorRef,
    private zoomTool: ZoomTool,
    private panTool: PanTool,
    private menuService: MenuService,
    private selectionService: SelectionService,
    private gridLinesRenderer: GridLinesRenderer,
    private toolsService: ToolsService,
    private pasteService: PasteService,
    private http: HttpClient
  ) {
    super();
  }

  ngOnInit(): void {
    this.viewService.menuVisibleSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((value) => {
        if (value !== this.showMenu) {
          this.showMenu = value;
          this.cdRef.markForCheck();
        }
      });
    this.menuService.menuChanged
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        let changed = true;
        let visible = this.menuService.isPanelVisible(PanelsIds.History);
        if (this.showHistory !== visible) {
          this.showHistory = visible;
          changed = true;
        }
        visible = this.menuService.isPanelVisible(PanelsIds.Outline);
        if (this.showOutline !== visible) {
          this.showOutline = visible;
          changed = true;
        }
        visible = this.menuService.isPanelVisible(PanelsIds.Properties);
        if (this.showProperties !== visible) {
          this.showProperties = visible;
          changed = true;
        }
        if (changed) {
          this.cdRef.markForCheck();
        }
      });

    this.gridLinesRenderer.gridLinesVisibleSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((gridLines) => {
        if (gridLines !== this.showGridLines) {
          this.showGridLines = gridLines;
          this.cdRef.markForCheck();
        }
      });

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
    this.gridLinesRenderer.rulerVisibleSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((visible) => {
        if (this.rulerVisible !== visible) {
          this.rulerVisible = visible;
          this.cdRef.markForCheck();
        }
      });

    // Load current recent items.
    this.setRecent(null);

    this.stateService.document
      .pipe(takeUntil(this.destroyed$))
      .subscribe((p) => {
        if (p) {
          this.title = p.title;
        } else {
          this.title = "";
        }

        this.cdRef.markForCheck();
      });

    this.viewService.viewModeSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((mode) => {
        if (this.mode !== mode) {
          this.mode = mode;
          this.cdRef.markForCheck();
        }
      });
  }
  setMode(mode: ViewMode) {
    this.viewService.setMode(mode);
  }
  newFile() {
    const fileName = `default.svg`;
    const folder = `assets/documents/${fileName}`;
    this.http.get(folder, { responseType: "text" }).subscribe(
      (data) => {
        this.loadData(data, fileName);
      },
      (error) => {
        alert(`File ${fileName} cannot be parsed!`);
        console.log(error);
      }
    );
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
        this.recentItems.find((p) => p.name === newRecentItem.name)
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
        str: data,
      };
      this.setRecent(newData);
    }
  }
  redo() {
    this.undoService.redo();
  }
  toggleMenu() {
    this.viewService.toggleMenu();
  }
  toggleHistory() {
    this.showHistory = this.togglePanel(PanelsIds.History);
  }
  toggleProperties() {
    this.showProperties = this.togglePanel(PanelsIds.Properties);
  }
  toggleOutline() {
    this.showOutline = this.togglePanel(PanelsIds.Outline);
  }
  togglePanel(panelId: PanelsIds): boolean {
    const visible = this.menuService.isPanelVisible(panelId);
    if (!visible) {
      this.viewService.openMenu();
    }
    this.menuService.setPanelVisibility(panelId, !visible);
    return !visible;
  }
  undo() {
    this.undoService.undo();
  }
  zoomIn() {
    this.zoomTool.zoomIn();
  }
  zoomOut() {
    this.zoomTool.zoomOut();
  }
  center() {
    this.panTool.fit();
  }
  fitViewport() {
    this.toolsService.fitViewport();
  }
  toggleGridLines() {
    this.gridLinesRenderer.toggleShowGridLines();
  }
  toggleRuler() {
    this.gridLinesRenderer.toggleRuler();
  }
  toggleBreadcrumbs() {
    this.viewService.toggleBreadcrumbs();
  }
  toggleCode() {
    this.viewService.toggleCode();
  }
  cut() {
    this.pasteService.cut();
  }
  copy() {
    this.pasteService.copy();
  }
  paste() {
    this.pasteService.paste();
  }
  delete() {
    this.pasteService.delete();
  }
  fitViewportSelected() {
    this.toolsService.fitViewportToSelected();
  }
  selectAll() {
    this.selectionService.selectAll();
  }
  selectNone() {
    this.selectionService.deselectAll();
  }
  selectSameType() {
    this.selectionService.selectSameType();
  }
  selectInverse() {
    this.selectionService.inverseSelection();
  }
}
