import { Injectable } from "@angular/core";
import { BaseTool } from "./base.tool";
import { CursorService } from "../cursor.service";
import { LoggerService } from "../logger.service";
import { SelectionService } from "../selection.service";
import { PathRenderer } from './renderers/path.renderer';
import { MouseOverRenderer } from './renderers/mouse-over.renderer';

@Injectable({
  providedIn: "root",
})
/**
 * Path direct selection
 */
export class PathDirectSelectionTool extends BaseTool {
  svgMatrix: DOMMatrix = null;
  mouseDownPos: DOMPoint = null;
  iconName = "navigation_outline";
  constructor(
    private selectionService: SelectionService,
    private logger: LoggerService,
    private cursor: CursorService,
    private pathRenderer: PathRenderer,
    private mouseOverRenderer: MouseOverRenderer
  ) {
    super();
    // this.pathRenderer.suspend();
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
