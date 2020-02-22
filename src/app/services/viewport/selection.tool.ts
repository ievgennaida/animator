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

  valueInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  rectItersects(rect1: DOMRect, rect2: DOMRect): boolean {
    if (!rect1 || !rect2) {
      return false;
    }

    const xOverlap =
      this.valueInRange(rect1.x, rect2.x, rect2.x + rect2.width) ||
      this.valueInRange(rect2.x, rect1.x, rect1.x + rect1.width);

    const yOverlap =
      this.valueInRange(rect1.y, rect2.y, rect2.y + rect2.height) ||
      this.valueInRange(rect2.y, rect1.y, rect1.y + rect1.height);

    return xOverlap && yOverlap;
  }

  /**
   * Override
   */
  selectionUpdate(event: MouseEventArgs) {
    if (!this.selectionRect) {
      return;
    }

    let matrix = this.viewportService.getCTM();
    let transformed = this.viewportService.matrixRectTransform(
      this.selectionRect,
      matrix
    );

    let selected: TreeNode[] = null;
    if (this.renderableElements && this.renderableElements.length > 0) {
      this.renderableElements.forEach((node: TreeNode) => {
        const renderable = node.tag as SVGGraphicsElement;
        if (renderable instanceof SVGGraphicsElement) {
          try {
            if (renderable.nodeName === "g") {
              return;
            }
            let bounds =  node.cache as DOMRect;
            if(!bounds || node.cacheIndex !== this.cacheIndex){
              bounds = renderable.getBoundingClientRect();
              bounds.x -= this.containerRect.left;
              bounds.y -= this.containerRect.top;
              node.cache = bounds;
              node.cacheIndex = this.cacheIndex;
            }

            if (this.rectItersects(bounds, transformed)) {
              if (!selected) {
                selected = [];
              }
              selected.push(node);
            }
          } catch (err) {
            this.logger.warn("Cannot check intersection" + err);
          }
        }
      });
    }

    this.outlineService.setMultipleSelected(selected);
  }

  onPlayerMouseOut(event: MouseEventArgs) {
    if (this.cachedMouse && this.cachedMouse.tag !== event.args.target) {
      const node = this.renderableElements.find(
        p => p.tag === event.args.target
      );
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
