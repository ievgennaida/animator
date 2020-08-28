import { Injectable } from "@angular/core";
import { TreeNode } from "../models/tree-node";
import { DocumentService } from "./document.service";
import { MouseOverService } from "./mouse-over.service";
import { OutlineService } from "./outline.service";
import { SelectionService } from "./selection.service";
import { ViewService } from "./view.service";
import { AdornersRenderer } from "./viewport/renderers/adorners.renderer";
import { BoundsRenderer } from "./viewport/renderers/bounds.renderer";
import { GridLinesRenderer } from "./viewport/renderers/grid-lines.renderer";
import { MouseOverRenderer } from "./viewport/renderers/mouse-over.renderer";
import { PathRenderer } from "./viewport/renderers/path.renderer";
import { SelectorRenderer } from "./viewport/renderers/selector.renderer";
import { ToolsService } from "./viewport/tools.service";
import { TransformsService } from "./viewport/transformations/transforms.service";
import { BaseRenderer } from "./viewport/renderers/base.renderer";

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
    private selectionService: SelectionService,
    viewService: ViewService,
    toolsService: ToolsService,
    documentService: DocumentService,
    pathRenderer: PathRenderer
  ) {
    toolsService.activeToolChanged().subscribe((activeTool) => {
      BaseRenderer.runSuspendedRenderers(() => {
        const isSelectionToolActive = activeTool === toolsService.selectionTool;
        boundsRenderer.drawNodeHandles = isSelectionToolActive;
        boundsRenderer.suppressMainSelection = !isSelectionToolActive;
        if (activeTool !== toolsService.pathTool) {
          mouseOverService.pathDataSubject.setNone();
          selectionService.pathDataSubject.setNone();
        }
      }, pathRenderer);
    });
    selectionService.pathDataSubject.subscribe(() => {
      boundsRenderer.invalidate();
      selectionService.pathDataSubject.calculateHandlesBounds();
    });
    selectionService.selected.subscribe((state) => {
      BaseRenderer.runSuspendedRenderers(
        () => {
          selectionService.calculateSelectionsAdorner(selectionService.getSelected());
          mouseOverService.pathDataSubject.leaveNodes(state.removed);
          // Deselect any path data were selected.
          selectionService.pathDataSubject.leaveNodes(state.removed);
        },
        pathRenderer,
        boundsRenderer
      );
    });

    documentService.documentSubject.asObservable().subscribe(() => {
      toolsService.fitViewport();
    });

    // Individual element is transformed.
    transformsService.transformed.subscribe(() => {
      // TODO: invalidate from current to all children
      this.cleanCache();
      boundsRenderer.invalidate();
      pathRenderer.invalidate();
    });

    // view is transformed: ex: zoom, size can remain the same.
    viewService.transformed.subscribe(() => {
      // Clean screen cache first when view is transformed
      this.cleanCache();
      adornersRenderer.invalidate();
      adornersRenderer.invalidateSizeChanged();
    });

    // view resized
    viewService.resized.subscribe(() => {
      this.cleanCache();
      adornersRenderer.invalidateSizeChanged();
    });

    mouseOverService.mouseOver.subscribe((treeNode: TreeNode) => {
      if (treeNode && treeNode.mouseOver) {
        mouseOverRenderer.node = treeNode;
      } else {
        mouseOverRenderer.node = null;
      }
      mouseOverRenderer.invalidate();
    });
    selectionService.pathDataSubject.subscribe((state) => {
      pathRenderer.invalidate();
      // console.log("handle selection changed");
    });
    mouseOverService.pathDataSubject.subscribe((state) => {
      pathRenderer.invalidate();
      // console.log("mouse over handle changed");
    });
    mouseOverService.mouseOverHandleSubject.subscribe((selectedHandle) => {
      mouseOverRenderer.invalidate();
      boundsRenderer.invalidate();
    });
  }

  cleanCache() {
    this.selectionService.calculateSelectionsAdorner(this.selectionService.getSelected());
    this.selectionService.pathDataSubject.calculateHandlesBounds();
    this.outlineService.getAllNodes().forEach((node) => node.cleanCache());
  }
  init() {}
}
