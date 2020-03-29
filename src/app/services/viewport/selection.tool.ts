import { MouseEventArgs } from "./mouse-event-args";
import { Injectable } from "@angular/core";
import { LoggerService } from "../logger.service";
import { ViewportService } from "./viewport.service";
import { BaseSelectionTool } from "./base-selection.tool";
import { PanTool } from "./pan.tool";
import { TreeNode } from "src/app/models/tree-node";
import { OutlineService, SelectionMode } from "../outline.service";
import { TransformFactory } from "./transformations/transform-factory";
import { Utils } from "../utils/utils";

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
  nodeTransform: TreeNode = null;
  lastDeg: number = null;
  transformation = null;
  constructor(
    viewportService: ViewportService,
    logger: LoggerService,
    panTool: PanTool,
    private transformFactory: TransformFactory,
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

  selectionStarted(event: MouseEventArgs) {
    this.lastDeg = null;
    super.selectionStarted(event);

    const nodeTransform = this.outlineService.mouseOverSubject.getValue();
    if (nodeTransform) {
      this.nodeTransform = nodeTransform;
      if(!nodeTransform || !nodeTransform.selected){
        return;
      }

      const element = nodeTransform.getElement();
      this.transformation = this.transformFactory.getTransformForElement(
        element
      );

      if (this.transformation) {
        // this.transformation.beginSkewTransaction(event.getDOMPoint());
        if (event.args.ctrlKey) {
          this.transformation.beginMouseRotateTransaction(event.getDOMPoint());
        } else {
          this.transformation.beginMouseTransaction(event.getDOMPoint());
        }
      }
    }
    // Use when accurate selection will be implemented, or to select groups:
    /* if (!this.nodeTransform) {
      this.nodeTransform = this.getIntersects(true) as TreeNode;
    } */
  }

  getIntersects(onlyFirst: boolean = false): TreeNode[] | TreeNode {
    const matrix = this.viewportService.getCTM();
    const transformed = Utils.matrixRectTransform(this.selectionRect, matrix);

    let selected: TreeNode[] = null;
    if (this.renderableElements && this.renderableElements.length > 0) {
      for (let i = this.renderableElements.length - 1; i >= 0; i--) {
        const node = this.renderableElements[i];
        const renderable = node.tag as SVGGraphicsElement;
        if (renderable instanceof SVGGraphicsElement) {
          try {
            let bounds = node.cache as DOMRect;
            if (!bounds || node.cacheIndex !== this.cacheIndex) {
              bounds = renderable.getBoundingClientRect();
              bounds.x -= this.containerRect.left;
              bounds.y -= this.containerRect.top;
              node.cache = bounds;
              node.cacheIndex = this.cacheIndex;
            }

            if (this.rectItersects(bounds, transformed)) {
              if (onlyFirst) {
                return node;
              }
              if (!selected) {
                selected = [];
              }
              selected.push(node);
            }
          } catch (err) {
            this.logger.warn("Cannot check intersection" + err);
          }
        }
      }
    }
    return selected;
  }

  cleanUp() {
    this.lastDeg = null;
    this.nodeTransform = null;
    super.cleanUp();
  }

  onWindowMouseMove(event: MouseEventArgs) {
    if (!this.nodeTransform || !this.nodeTransform.selected) {
      super.onWindowMouseMove(event);
    } else if (this.containerRect) {
      const element = this.nodeTransform.getElement();
      if (element) {
        // this.rotateByMouse(event, element);
        this.moveByMouse(event, element);
      }
    }
  }

  moveByMouse(event: MouseEventArgs, element: SVGGraphicsElement) {
    const screenPos = event.getDOMPoint();
    if (this.transformation) {
      // this.transformation.skewByMouse(screenPos);
      if (this.transformation.offset) {
        this.transformation.moveByMouse(screenPos);
      } else {
        this.transformation.rotateByMouse(screenPos);
      }
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
    if (this.nodeTransform) {
      return;
    }

    const node = this.renderableElements.find(p => p.tag === event.args.target);
    if (!node) {
      return;
    }

    this.cachedMouse = node;
    this.outlineService.setMouseOver(node);
  }

  /**
   * override
   */
  selectionEnded(event: MouseEventArgs) {
    if (this.nodeTransform && this.nodeTransform.selected) {
      // transformations were applied.
      return;
    }

    let mode = SelectionMode.Normal;
    if (event.args.ctrlKey) {
      mode = SelectionMode.Revert;
    } else if (event.args.shiftKey) {
      mode = SelectionMode.Add;
    }

    if (this.click) {
      const mouseOverTransform = this.outlineService.mouseOverSubject.getValue();
      this.outlineService.setSelected(mouseOverTransform, mode);
    } else {
      const selected = this.getIntersects() as TreeNode[];
      this.outlineService.setSelected(selected, mode);
    }
  }
}
