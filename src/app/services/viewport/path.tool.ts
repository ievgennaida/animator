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

@Injectable({
  providedIn: "root",
})
/**
 * Create path tool
 */
export class PathTool extends SelectionTool {
  svgMatrix: DOMMatrix = null;
  mouseDownPos: DOMPoint = null;
  iconName = "ink_pen";

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
}
