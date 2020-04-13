import { Injectable } from "@angular/core";
import { BaseTool } from "./base.tool";
import { CursorService } from "../cursor.service";
import { LoggerService } from "../logger.service";
import { SelectionService } from "../selection.service";
import { PathRenderer } from "./renderers/path.renderer";
import { MouseOverRenderer } from "./renderers/mouse-over.renderer";
import { BaseSelectionTool } from "./base-selection.tool";
import { TransformsService } from "./transformations/transforms.service";
import { SelectorRenderer } from "./renderers/selector.renderer";
import { PanTool } from "./pan.tool";
import { ViewService } from "../view.service";
import { MouseEventArgs } from "./mouse-event-args";
import { Utils } from "../utils/utils";
import { PathDataCommand } from 'src/app/models/path/path-data-command';

@Injectable({
  providedIn: "root",
})
/**
 * Path direct selection
 */
export class PathDirectSelectionTool extends BaseSelectionTool {
  svgMatrix: DOMMatrix = null;
  mouseDownPos: DOMPoint = null;
  iconName = "navigation_outline";
  constructor(
    private selectionService: SelectionService,
    logger: LoggerService,
    private cursor: CursorService,
    private pathRenderer: PathRenderer,
    private mouseOverRenderer: MouseOverRenderer,
    selectorRenderer: SelectorRenderer,
    transformsService: TransformsService,
    viewService: ViewService,
    panTool: PanTool
  ) {
    super(selectorRenderer, transformsService, viewService, logger, panTool);
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

  onViewportContextMenu(event: MouseEventArgs) {
    /*const startedNode = this.outlineService.mouseOverSubject.getValue();
    if (startedNode) {
      this.contextMenu.open(event.args as MouseEvent, startedNode);
    }*/
    super.onViewportContextMenu(event);
  }

  selectionStarted(event: MouseEventArgs) {
    super.selectionStarted(event);
    // dont allow to transfrom on right click:
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
        if (data.commands) {
          data.commands.forEach((command) => {
            const abs = command.getAbsolute();
            const l = Utils.getLenght(p, abs.p);
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

  moveByMouse(event: MouseEventArgs, element: SVGGraphicsElement) {}

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
