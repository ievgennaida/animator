import { BaseTool } from "./base.tool";
import { MouseEventArgs } from "../../models/mouse-event-args";
import { Injectable } from "@angular/core";
import { LoggerService } from "../logger.service";
import { ViewService } from "../view.service";
import { CursorService } from "../cursor.service";
import { CursorType } from "src/app/models/cursor-type";
import { SelectionTool } from "./selection.tool";
import { TransformsService } from "./transformations/transforms.service";
import { SelectorRenderer } from "./renderers/selector.renderer";
import { SelectionService } from "../selection.service";
import { BoundsRenderer } from "./renderers/bounds.renderer";
import { ContextMenuService } from "../context-menu.service";
import { MouseOverRenderer } from "./renderers/mouse-over.renderer";
import { MouseOverService } from "../mouse-over.service";
import { OutlineService } from "../outline.service";
import { PanTool } from "./pan.tool";
import { PathRenderer } from "./renderers/path.renderer";
import { IntersectionService } from "../intersection.service";
import { Utils } from "../utils/utils";
import { TreeNode } from "src/app/models/tree-node";
import { consts } from "src/environments/consts";

@Injectable({
  providedIn: "root",
})
/**
 * Path direct selection
 */
export class PathDirectSelectionTool extends SelectionTool {
  svgMatrix: DOMMatrix = null;
  mouseDownPos: DOMPoint = null;
  iconName = "navigation_outline";
  constructor(
    private pathRenderer: PathRenderer,
    transformsService: TransformsService,
    viewService: ViewService,
    logger: LoggerService,
    panTool: PanTool,
    selectorRenderer: SelectorRenderer,
    intersectionService: IntersectionService,
    selectionService: SelectionService,
    boundsRenderer: BoundsRenderer,
    transformFactory: TransformsService,
    outlineService: OutlineService,
    mouseOverService: MouseOverService,
    mouseOverRenderer: MouseOverRenderer,
    cursor: CursorService,
    contextMenu: ContextMenuService
  ) {
    super(
      transformsService,
      viewService,
      logger,
      panTool,
      selectorRenderer,
      intersectionService,
      selectionService,
      boundsRenderer,
      transformFactory,
      outlineService,
      mouseOverService,
      mouseOverRenderer,
      cursor,
      contextMenu
    );
  }

  /**
   * Override
   */
  onDeactivate() {
    this.pathRenderer.suspend();
    this.pathRenderer.clear();
    super.onDeactivate();
  }
  /**
   * Override
   */
  onActivate() {
    this.pathRenderer.invalidate();
    this.pathRenderer.resume();
    super.onActivate();
  }
  /**
   * Override
   */
  onViewportContextMenu(event: MouseEventArgs) {
    /*const startedNode = this.outlineService.mouseOverSubject.getValue();
    if (startedNode) {
      this.contextMenu.open(event.args as MouseEvent, startedNode);
    }*/
    super.onViewportContextMenu(event);
  }
  /**
   * Override
   */
  selectionStarted(event: MouseEventArgs) {
    // super.selectionStarted(event);
    // don't allow to transform on right click:
    if (event.rightClicked()) {
      this.cleanUp();
      return;
    }
  }
  /**
   * Override
   */
  cleanUp() {
    this.mouseOverRenderer.resume();
    // this.lastDeg = null;
    // this.startedNode = null;
    super.cleanUp();
    // this.cursor.setCursor(CursorType.Default);
  }

  selectionRectToNodeCoordinates(node: TreeNode): DOMRect {
    if (!node) {
      return null;
    }

    const screenCTM = node.getScreenCTM();
    const viewportScreenCTM = this.viewService.getScreenCTM();
    if (!screenCTM || !viewportScreenCTM) {
      return;
    }
    const outputRect = Utils.matrixRectTransform(
      this.selectionRect,
      screenCTM.inverse().multiply(viewportScreenCTM)
    );

    return outputRect;
  }
  /**
   * Override
   */
  onWindowMouseMove(event: MouseEventArgs) {
    if (this.selectionRect && !this.click) {
      this.mouseOverRenderer.suspend(true);
    }

    super.onWindowMouseMove(event);

    const screenPos = event.getDOMPoint();
    const nodes = this.selectionService.getSelected();
    if (nodes) {
      nodes.forEach((node) => {
        const data = node.getPathData();
        const p = Utils.toElementPoint(node, screenPos);
        const rectSelector = this.selectionRectToNodeCoordinates(node);
        if (p && data && data.commands) {
          data.commands.forEach((command, index) => {
            const abs = command.getAbsolute();
            const l = Utils.getLength(p, abs.p);
            // TODO: extract, reuse
            const screenPointSize = Utils.getLength(
              Utils.toElementPoint(
                node,
                new DOMPoint(screenPos.x + 1, screenPos.y + 1)
              ),
              p
            );

            const accuracy = screenPointSize * consts.handleSize;

            let selected = l <= accuracy;
            if (rectSelector) {
              selected =
                selected || Utils.rectIntersectPoint(rectSelector, abs.p);
            }

            if (abs.selected !== selected) {
              abs.selected = selected;
              this.pathRenderer.invalidate();
            }
          });
        }
      });
    }
  }

  /**
   * Override
   */
  selectionUpdate(event: MouseEventArgs) {
    if (!this.selectionRect) {
      return;
    }

    // const selected = this.getIntersects() as TreeNode[];
    // this.outlineService.setSelected(selected);
  }

  /**
   * Override
   */
  selectionEnded(event: MouseEventArgs) {
    if (this.click) {
      super.selectionEnded(event);
    }
  }
}
