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
import { PathDataCommand } from "src/app/models/path/path-data-command";
import { PathDataHandle } from "src/app/models/path-data-handle";
import { ChangeStateMode } from "../state-subject";

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
    // don't allow to transform on right click:
    if (event.rightClicked()) {
      this.cleanUp();
      return;
    }
    if (!event.ctrlKey && !event.shiftKey) {
      this.selectionService.pathDataSubject.setNone();
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
    const overPoints = this.intersectionService.intersectPathDataHandles(
      nodes,
      this.selectionRect,
      screenPos
    );

    this.mouseOverService.pathDataSubject.change(
      overPoints,
      ChangeStateMode.Normal
    );
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
    const screenPos = event.getDOMPoint();
    const nodes = this.selectionService.getSelected();
    const overPoints = this.intersectionService.intersectPathDataHandles(
      nodes,
      this.click ? null : this.selectionRect,
      screenPos
    );

    let changeStateMode = ChangeStateMode.Normal;
    if (this.click) {
      if (!overPoints || overPoints.length === 0) {
        super.selectionEnded(event);
      }
      if (event.shiftKey || event.ctrlKey) {
        changeStateMode = ChangeStateMode.Revert;
      }
    } else {
      changeStateMode = ChangeStateMode.Append;
    }
    this.pathRenderer.suspend();
    this.mouseOverService.pathDataSubject.setNone();
    this.selectionService.pathDataSubject.change(overPoints, changeStateMode);

    this.pathRenderer.resume();
    this.selectionRect = null;
  }
}
