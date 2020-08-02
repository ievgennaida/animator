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
import { Utils } from '../utils/utils';

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

  onDeactivate() {
    this.pathRenderer.suspend();
    this.pathRenderer.clear();
    this.mouseOverRenderer.resume();
    super.onDeactivate();
  }
  onActivate() {
    this.mouseOverRenderer.suspend();
    this.pathRenderer.invalidate();
    this.pathRenderer.resume();
    super.onActivate();
  }

  onViewportContextMenu(event: MouseEventArgs) {
    /*const startedNode = this.outlineService.mouseOverSubject.getValue();
    if (startedNode) {
      this.contextMenu.open(event.args as MouseEvent, startedNode);
    }*/
    super.onViewportContextMenu(event);
  }

  selectionStarted(event: MouseEventArgs) {
    super.selectionStarted(event);
    // don't allow to transform on right click:
    if (event.rightClicked()) {
      this.cleanUp();
      return;
    }

    const screenPoint = event.getDOMPoint();
  }

  cleanUp() {
    this.mouseOverRenderer.resume();
    // this.lastDeg = null;
    // this.startedNode = null;
    super.cleanUp();
    // this.cursor.setCursor(CursorType.Default);
  }

  onWindowMouseMove(event: MouseEventArgs) {
    const screenPos = event.getDOMPoint();
    const nodes = this.selectionService.getSelected();
    if (nodes) {
      nodes.forEach((node) => {
        const data = node.getPathData();
        const p = Utils.toElementPoint(node, screenPos);
        if (!p && data && data.commands) {
          data.commands.forEach((command) => {
            const abs = command.getAbsolute();
            const l = Utils.getLength(p, abs.p);
            const selected = l <= 10;
            if (command.selected !== selected) {
              command.selected = selected;
              this.pathRenderer.invalidate();
            }
          });
        }
      });
    }
  }

  /**
   * override
   */
  selectionUpdate(event: MouseEventArgs) {
    if (!this.selectionRect) {
      return;
    }

    // const selected = this.getIntersects() as TreeNode[];
    // this.outlineService.setSelected(selected);
  }

  onPlayerMouseOut(event: MouseEventArgs) {}

  onPlayerMouseOver(event: MouseEventArgs) {}

  /**
   * override
   */
  selectionEnded(event: MouseEventArgs) {}
}
