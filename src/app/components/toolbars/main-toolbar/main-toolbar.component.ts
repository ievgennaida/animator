import { HttpClient } from "@angular/common/http";
import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { InputDocument } from "src/app/models/input-document";
import { InputDocumentType } from "src/app/models/input-document-type";
import { ViewMode } from "src/app/models/view-mode";
import { BaseCommand } from "src/app/services/commands/base-command";
import { CommandsService } from "src/app/services/commands/commands-services/commands-service";
import { DocumentService } from "src/app/services/document.service";
import { LoggerService } from "src/app/services/logger.service";
import { MenuService } from "src/app/services/menu-service";
import { PasteService } from "src/app/services/paste.service";
import { GridLinesRenderer } from "src/app/services/renderers/grid-lines.renderer";
import { SelectionService } from "src/app/services/selection.service";
import { PanTool } from "src/app/services/tools/pan.tool";
import { ToolsService } from "src/app/services/tools/tools.service";
import { ZoomTool } from "src/app/services/tools/zoom.tool";
import { UndoService } from "src/app/services/undo.service";
import { ViewService } from "src/app/services/view.service";
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
  implements OnInit, OnDestroy, AfterContentChecked {
  title = "animation";
  undoDisabled = !this.undoService.canUndo();
  redoDisabled = !this.undoService.canRedo();
  recentItems = [];
  showGridLines = this.gridLinesRenderer.gridLinesVisible();
  showMenu = this.viewService.menuVisibleSubject.getValue();
  showHistory = this.menuService.isPanelVisible(PanelsIds.history);
  showOutline = this.menuService.isPanelVisible(PanelsIds.outline);
  showProperties = this.menuService.isPanelVisible(PanelsIds.properties);
  codeVisible = this.viewService.codeVisibleSubject.getValue();
  breadcrumbsVisible = this.viewService.breadcrumbsVisibleSubject.getValue();
  rulerVisible = this.gridLinesRenderer.rulerVisibleSubject.getValue();
  editMenuCommands: BaseCommand[] = [];
  mode: ViewMode = consts.appearance.defaultMode;
  // eslint-disable-next-line @typescript-eslint/naming-convention
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
    private http: HttpClient,
    private commandsService: CommandsService
  ) {
    super();
  }

  updateUndoState(): void {
    this.undoDisabled = !this.undoService.canUndo();
    this.redoDisabled = !this.undoService.canRedo();
    this.cdRef.markForCheck();
  }
  ngOnInit(): void {
    this.editMenuCommands = this.commandsService.getEditMenuCommands();
    this.undoService.actionIndexSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.updateUndoState();
      });

    this.undoService.actionsSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.updateUndoState();
      });

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
        let visible = this.menuService.isPanelVisible(PanelsIds.history);
        if (this.showHistory !== visible) {
          this.showHistory = visible;
          changed = true;
        }
        visible = this.menuService.isPanelVisible(PanelsIds.outline);
        if (this.showOutline !== visible) {
          this.showOutline = visible;
          changed = true;
        }
        visible = this.menuService.isPanelVisible(PanelsIds.properties);
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
  ngAfterContentChecked(): void {
    // Fixed bug with material menu that menu trigger cannot be part of the custom component during the lifecycle.
    this.cdRef.markForCheck();
  }
  setMode(mode: ViewMode): void {
    this.viewService.setMode(mode);
  }
  newFile(): void {
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
  fileSelected(event): void {
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

  setRecent(newRecentItem: any): void {
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
  loadData(data, title: string): void {
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
        parsed.type = InputDocumentType.svg;
      } else if (lower.endsWith("json")) {
        const parsedJson = JSON.parse(data);
        parsed = new InputDocument();
        parsed.data = data;
        parsed.title = title;
        parsed.parsedData = parsedJson;
        parsed.type = InputDocumentType.json;
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
  redo(): void {
    this.undoService.redo();
  }
  toggleMenu(): void {
    this.viewService.toggleMenu();
  }
  toggleHistory(): void {
    this.showHistory = this.togglePanel(PanelsIds.history);
  }
  toggleProperties(): void {
    this.showProperties = this.togglePanel(PanelsIds.properties);
  }
  toggleOutline(): void {
    this.showOutline = this.togglePanel(PanelsIds.outline);
  }
  togglePanel(panelId: PanelsIds): boolean {
    const visible = this.menuService.isPanelVisible(panelId);
    if (!visible) {
      this.viewService.openMenu();
    }
    this.menuService.setPanelVisibility(panelId, !visible);
    return !visible;
  }
  undo(): void {
    this.undoService.undo();
  }
  zoomIn(): void {
    this.zoomTool.zoomIn();
  }
  zoomOut(): void {
    this.zoomTool.zoomOut();
  }
  center(): void {
    this.panTool.fit();
  }
  fitViewport(): void {
    this.toolsService.fitViewport();
  }
  toggleGridLines(): void {
    this.gridLinesRenderer.toggleShowGridLines();
  }
  toggleRuler(): void {
    this.gridLinesRenderer.toggleRuler();
  }
  toggleBreadcrumbs(): void {
    this.viewService.toggleBreadcrumbs();
  }
  toggleCode(): void {
    this.viewService.toggleCode();
  }
  fitViewportSelected(): void {
    this.toolsService.fitViewportToSelected();
  }
}
