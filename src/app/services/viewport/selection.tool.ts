import { MouseEventArgs } from "./MouseEventArgs";
import { Injectable } from "@angular/core";
import { LoggerService } from "../logger.service";
import { ViewportService } from "./viewport.service";
import { BaseSelectionTool } from "./base-selection.tool";
import { PanTool } from "./pan.tool";
import { consts } from "src/environments/consts";
import { TreeNode } from "src/app/models/tree-node";
import { OutlineService } from "../outline.service";

/**
 * Select elements by a mouse move move.
 */
@Injectable({
  providedIn: "root"
})
export class SelectionTool extends BaseSelectionTool {
  iconName = "navigation";
  renderableElements: Array<TreeNode> = [];
  cachedMouse: TreeNode = null;
  constructor(
    viewportService: ViewportService,
    logger: LoggerService,
    panTool: PanTool,
    private outlineService: OutlineService
  ) {
    super(viewportService, logger, panTool);
    outlineService.flatList.subscribe(flatItems => {
      this.renderableElements = flatItems;
    });
  }

  /**
   * Override
   */
  selectionUpdate(e: MouseEventArgs) {
    if (this.renderableElements && this.renderableElements.length > 0) {
      this.renderableElements.forEach((node: TreeNode) => {
        const renderable = node.tag as SVGElement;
        if (renderable instanceof SVGElement) {
          try {
            if (renderable.nodeName === "g") {
              return;
            }
            const rect = renderable.getBoundingClientRect();
            // node.selected = true;
          } catch (err) {
            this.logger.warn("Cannot check intersection");
          }
        }
      });
    }
  }

  onPlayerMouseOut(event: MouseEventArgs) {
    if (this.cachedMouse && this.cachedMouse.tag !== event.args.target) {
      const node = this.renderableElements.find(p => p.tag === event.args.target);
      this.outlineService.setMouseLeave(node);
    } else {
      this.outlineService.setMouseLeave(this.cachedMouse);
      this.cachedMouse = null;
    }
  }

  onPlayerMouseOver(event: MouseEventArgs) {
    const node = this.renderableElements.find(p => p.tag === event.args.target);
    if (!node) {
      return;
    }
    this.cachedMouse = node;
    this.outlineService.setMouseOver(node);
  }

  /**
   * Override
   */
  selectionEnded(e: MouseEventArgs) {}
}
