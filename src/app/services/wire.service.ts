import { Injectable } from "@angular/core";
import { TreeNode } from "../models/tree-node";
import { AdornersService } from "./adorners-service";
import { DocumentLoadedAction } from "./actions/document-loaded-action";
import { UndoService } from "./undo.service";
import { DocumentService } from "./document.service";
import { MouseOverService } from "./mouse-over.service";
import { OutlineService } from "./outline.service";
import { SelectionService } from "./selection.service";
import { ViewService } from "./view.service";
import { AdornersRenderer } from "./viewport/renderers/adorners.renderer";
import { BaseRenderer } from "./viewport/renderers/base.renderer";
import { BoundsRenderer } from "./viewport/renderers/bounds.renderer";
import { GridLinesRenderer } from "./viewport/renderers/grid-lines.renderer";
import { MouseOverRenderer } from "./viewport/renderers/mouse-over.renderer";
import { PathRenderer } from "./viewport/renderers/path.renderer";
import { SelectorRenderer } from "./viewport/renderers/selector.renderer";
import { ToolsService } from "./viewport/tools.service";
import { TransformsService } from "./viewport/transforms.service";
import { merge } from "rxjs";

/**
 * Wire services together
 */
@Injectable({
  providedIn: "root",
})
export class WireService {
  constructor(
    private outlineService: OutlineService,
    mouseOverRenderer: MouseOverRenderer,
    mouseOverService: MouseOverService,
    boundsRenderer: BoundsRenderer,
    selectorRenderer: SelectorRenderer,
    transformsService: TransformsService,
    gridLinesRenderer: GridLinesRenderer,
    adornersRenderer: AdornersRenderer,
    private adornersService: AdornersService,
    private selectionService: SelectionService,
    private undoService: UndoService,
    viewService: ViewService,
    toolsService: ToolsService,
    documentService: DocumentService,
    pathRenderer: PathRenderer
  ) {
    toolsService.activeToolChanged().subscribe((activeTool) => {
      BaseRenderer.runSuspendedRenderers(() => {
        const isSelectionToolActive = activeTool === toolsService.selectionTool;
        adornersService.adornerHandlesActive = isSelectionToolActive;
        boundsRenderer.suppressMainSelection = !isSelectionToolActive;
        if (activeTool !== toolsService.pathTool) {
          mouseOverService.pathDataSubject.setNone();
          selectionService.pathDataSubject.setNone();
        }
        boundsRenderer.invalidate();
      }, pathRenderer);
    });
    selectionService.pathDataSubject.subscribe(() => {
      boundsRenderer.invalidate();
      // Recalculate path data adorners on selection change
      selectionService.pathDataSubject.calculateHandlesBounds();
    });
    selectionService.selected.subscribe((state) => {
      BaseRenderer.runSuspendedRenderers(
        () => {
          this.buildSelectedAdorner();
          // Remove mouse over path data states:
          mouseOverService.pathDataSubject.leaveNodes(state.removed);
          // Deselect any path data were selected.
          selectionService.pathDataSubject.leaveNodes(state.removed);
        },
        pathRenderer,
        boundsRenderer
      );
    });

    // On new document loaded.
    documentService.documentSubject.asObservable().subscribe((document) => {
      this.undoService.clean();
      // Add document node when loaded:
      if (document) {
        const firstUndoItem = new DocumentLoadedAction();
        firstUndoItem.tooltip = `Document loaded: ${document.title}`;
        this.undoService.addAction(firstUndoItem);
      }
      this.outlineService.clear();
      this.cleanCache();
      this.adornersService.cleanCache();
      toolsService.fitViewport();
      this.selectionService.deselectAll();
    });
    merge(
      undoService.actionIndexSubject,
      // Individual element is transformed.
      transformsService.transformed
    ).subscribe(() => {
      // TODO: invalidate from current to all children
      BaseRenderer.runSuspendedRenderers(
        () => {
          this.cleanCache();
          this.buildSelectedAdorner();
        },
        boundsRenderer,
        pathRenderer,
        mouseOverRenderer
      );
    });

    // view is transformed: ex: zoom, size can remain the same.
    viewService.transformed.subscribe(() => {
      // Clean screen cache first when view is transformed
      this.cleanCache();
      this.adornersService.buildSelectionAdorner(
        this.selectionService.getSelected()
      );
      this.buildSelectedAdorner();
      adornersRenderer.invalidate();
      adornersRenderer.invalidateSizeChanged();
    });

    // view resized
    viewService.resized.subscribe(() => {
      this.cleanCache();

      adornersRenderer.invalidateSizeChanged();
    });

    // Wire mouse over service with mouse over bounds renderer.
    // Note: each renderer can be suspended.
    // Most of the renderers are suspended by tools.
    mouseOverService.mouseOver.subscribe((treeNode: TreeNode) => {
      if (treeNode && treeNode.mouseOver) {
        mouseOverRenderer.node = treeNode;
      } else {
        mouseOverRenderer.node = null;
      }
      mouseOverRenderer.invalidate();
    });
    // On path data selected
    selectionService.pathDataSubject.subscribe(() => {
      pathRenderer.invalidate();
      // console.log("handle selection changed");
    });
    // On path data mouse over
    mouseOverService.pathDataSubject.subscribe(() => {
      pathRenderer.invalidate();
      // console.log("mouse over handle changed");
    });

    // On adorner mouse over
    mouseOverService.mouseOverHandleSubject.subscribe(() => {
      mouseOverRenderer.invalidate();
      boundsRenderer.invalidate();
    });

    // Update selection when tree nodes list changed (deleted, grouped, undo and etc):
    this.outlineService.nodesSubject.subscribe(() => {
      BaseRenderer.runSuspendedRenderers(
        () => {
          this.cleanCache();
          const nodes = this.outlineService.getAllNodes();
          const selected = this.selectionService.getSelected();
          const toDeselect = [];
          selected.forEach((selectedNode) => {
            // One of the selected nodes does not exists anymore:
            if (nodes.indexOf(selectedNode) < 0) {
              toDeselect.push(selectedNode);
            }
          });

          if (toDeselect.length > 0) {
            this.selectionService.deselect(toDeselect);
          }
        },
        mouseOverRenderer,
        boundsRenderer
      );
    });
  }
  /**
   * Build multiple items selection adorner on selected changed
   */
  buildSelectedAdorner() {
    const selected = this.selectionService.getSelected();
    selected.forEach((p) => p.cleanCache());
    this.adornersService.buildSelectionAdorner(selected);
  }

  cleanCache() {
    this.selectionService.pathDataSubject.calculateHandlesBounds();
    this.adornersService.cleanCache();
    this.outlineService.getAllNodes().forEach((node) => node.cleanCache());
  }
  init() {}
}
