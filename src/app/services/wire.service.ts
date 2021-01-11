import { Injectable } from "@angular/core";
import { merge } from "rxjs";
import { TreeNode } from "../models/tree-node";
import { DocumentLoadedAction } from "./actions/document-loaded-action";
import { AdornersService } from "./adorners-service";
import { DocumentService } from "./document.service";
import { MouseOverService } from "./mouse-over.service";
import { OutlineService } from "./outline.service";
import { PathDataPropertyKey, PropertiesService } from "./properties.service";
import { AdornersRenderer } from "./renderers/adorners.renderer";
import { BaseRenderer } from "./renderers/base.renderer";
import { BoundsRenderer } from "./renderers/bounds.renderer";
import { GridLinesRenderer } from "./renderers/grid-lines.renderer";
import { MouseOverRenderer } from "./renderers/mouse-over.renderer";
import { PathRenderer } from "./renderers/path.renderer";
import { SelectorRenderer } from "./renderers/selector.renderer";
import { SelectionService } from "./selection.service";
import { ToolsService } from "./tools/tools.service";
import { TransformsService } from "./tools/transforms.service";
import { UndoService } from "./undo.service";
import { ViewService } from "./view.service";

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
    propertiesService: PropertiesService,
    viewService: ViewService,
    toolsService: ToolsService,
    documentService: DocumentService,
    pathRenderer: PathRenderer
  ) {
    toolsService.activeToolChanged().subscribe((activeTool) => {
      BaseRenderer.invalidateOnceAfter(
        () => {
          const isSelectionToolActive =
            activeTool === toolsService.selectionTool;
          const isDirectPathTool = activeTool === toolsService.pathTool;
          adornersService.selectionAdorner.showHandles = isSelectionToolActive;
          adornersService.pathDataSelectionAdorner.showHandles = isDirectPathTool;

          if (!isDirectPathTool) {
            mouseOverService.pathDataSubject.setNone();
            selectionService.pathDataSubject.setNone();
          }

          this.buildPathDataSelectionAdorner();
        },
        boundsRenderer,
        pathRenderer
      );
    });
    propertiesService.changedSubject.subscribe((prop) => {
      if (!prop || prop.key === PathDataPropertyKey) {
        pathRenderer.invalidate();
        boundsRenderer.invalidate();
      }
    });
    selectionService.pathDataSubject.subscribe(() => {
      BaseRenderer.invalidateOnceAfter(() => {
        // Recalculate path data adorners on selection change
        this.buildPathDataSelectionAdorner();
      }, boundsRenderer);
    });
    selectionService.selected.subscribe((state) => {
      BaseRenderer.invalidateOnceAfter(
        () => {
          // Remove mouse over path data states:
          mouseOverService.pathDataSubject.leaveNodes(state.removed);
          // Deselect any path data were selected.
          selectionService.pathDataSubject.leaveNodes(state.removed);
          this.buildSelectionAdorner();
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
      adornersRenderer.invalidate();
    });
    merge(
      undoService.actionIndexSubject,
      // Individual element is transformed.
      transformsService.transformed
    ).subscribe(() => {
      // TODO: invalidate from current to all children
      BaseRenderer.invalidateOnceAfter(
        () => {
          this.cleanCache();
          this.buildSelectionAdorner();
          this.buildPathDataSelectionAdorner();
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
      this.buildSelectionAdorner();
      this.buildPathDataSelectionAdorner();

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
      BaseRenderer.invalidateOnceAfter(
        () => {
          this.cleanCache();

          // Deselect nodes that was removed from the outline tree
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
  buildSelectionAdorner(resetCenterTransform = false) {
    const selectedNodes = this.selectionService.getSelected();
    selectedNodes.forEach((p) => p.cleanCache());
    this.adornersService.buildSelectionAdorner(
      this.outlineService.rootNode,
      selectedNodes,
      resetCenterTransform
    );
  }

  buildPathDataSelectionAdorner() {
    this.adornersService.buildPathDataSelectionAdorner(
      this.outlineService.rootNode
    );
  }
  cleanCache() {
    this.buildPathDataSelectionAdorner();
    this.adornersService.cleanCache();
    this.outlineService.getAllNodes().forEach((node) => node.cleanCache());
  }
  init() {}
}
