import { Injectable } from "@angular/core";
import { OutlineService } from "./outline.service";
import { MouseOverRenderer } from "./viewport/renderers/mouse-over.renderer";
import { TreeNode } from "../models/tree-node";
import { BoundsRenderer } from "./viewport/renderers/bounds.renderer";
import { GridLinesRenderer } from "./viewport/renderers/grid-lines.renderer";
import { SelectorRenderer } from "./viewport/renderers/selector.renderer";
import { TransformsService } from "./viewport/transformations/transforms.service";
import { ViewService } from "./view.service";
import { AdornersRenderer } from "./viewport/renderers/adorners.renderer";
import { SelectionService } from "./selection.service";
import { PathRenderer } from "./viewport/renderers/path.renderer";
import { ToolsService } from "./viewport/tools.service";
import { DocumentService } from "./document.service";
import { MouseOverService } from "./mouse-over.service";

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
    selectionService: SelectionService,
    viewService: ViewService,
    toolsService: ToolsService,
    documentService: DocumentService,
    pathRenderer: PathRenderer
  ) {
    toolsService.activeToolChanged().subscribe((activeTool) => {
      boundsRenderer.drawNodeHandles =
        activeTool === toolsService.selectionTool;
      pathRenderer.invalidate();
    });
    selectionService.selected.subscribe(() => {
      boundsRenderer.invalidate();
      pathRenderer.invalidate();
    });

    documentService.documentSubject.asObservable().subscribe(() => {
      toolsService.fitViewport();
    });

    // Individual element is transformed.
    transformsService.transformed.subscribe((element) => {
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
    mouseOverService.handleOverSubject.subscribe((selectedHandle) => {
      mouseOverRenderer.invalidate();
      boundsRenderer.invalidate();
    });
  }
  cleanCache() {
    this.outlineService.getAllNodes().forEach((node) => node.cleanCache());
  }
  init() {}
}
