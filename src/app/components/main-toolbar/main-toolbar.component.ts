import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  ChangeDetectionStrategy,
} from "@angular/core";
import { UndoService } from "src/app/services/actions/undo.service";
import { DocumentService } from "src/app/services/document.service";
import { LoggerService } from "src/app/services/logger.service";
import { consts } from "src/environments/consts";
import {
  InputDocument,
  InputDocumentType,
} from "src/app/models/input-document";
import { ViewService } from "src/app/services/view.service";
import { ZoomTool } from "src/app/services/viewport/zoom.tool";
import { PanTool } from "src/app/services/viewport/pan.tool";
import { ToolsService } from "src/app/services/viewport/tools.service";
import { Subject } from "rxjs";
import { GridLinesRenderer } from "src/app/services/viewport/renderers/grid-lines.renderer";
import { takeUntil } from "rxjs/operators";
import { SelectionService } from "src/app/services/selection.service";
import { PasteService } from "src/app/services/paste.service";
import { ViewMode } from "src/environments/view-mode";

@Component({
  selector: "app-main-toolbar",
  templateUrl: "./main-toolbar.component.html",
  styleUrls: ["./main-toolbar.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainToolbarComponent implements OnInit, OnDestroy {
  title = "animation";
  undoDisabled = false;
  redoDisabled = false;
  recentItems = [];
  private destroyed$ = new Subject();
  showGridLines = this.gridLinesRenderer.gridLinesVisible();
  showProperties = this.viewService.menuVisibleSubject.getValue();
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
    private selectionService: SelectionService,
    private gridLinesRenderer: GridLinesRenderer,
    private toolsService: ToolsService,
    private pasteService: PasteService
  ) {}

  ngOnInit(): void {
    this.viewService.menuVisibleSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((value) => {
        if (value !== this.showProperties) {
          this.showProperties = value;
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

    this.stateService.document.subscribe((p) => {
      if (p) {
        this.title = p.title;
      } else {
        this.title = "";
      }

      this.cdRef.markForCheck();
    });

    this.viewService.viewModeSubject.asObservable().subscribe((mode) => {
      if (this.mode !== mode) {
        this.mode = mode;
        this.cdRef.markForCheck();
      }
    });
  }
  setMode(mode: ViewMode) {
    this.viewService.setMode(mode);
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
  toogleMenu() {
    this.viewService.toogleMenu();
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
  toogleGridLines() {
    this.gridLinesRenderer.toogleShowGridLines();
  }
  toogleRuler() {
    this.gridLinesRenderer.toogleRuler();
  }
  toogleBreadcrumbs() {
    this.viewService.toogleBreadcrumbs();
  }
  toogleCode() {
    this.viewService.toogleCode();
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
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
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
