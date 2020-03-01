import { MouseEventArgs } from "./MouseEventArgs";
import { Injectable } from "@angular/core";
import { LoggerService } from "../logger.service";
import { ViewportService } from "./viewport.service";
import { BaseSelectionTool } from "./base-selection.tool";
import { PanTool } from "./pan.tool";
import { consts } from "src/environments/consts";
import { TreeNode } from "src/app/models/tree-node";
import { OutlineService } from "../outline.service";
import { TransformFactory } from "./transformations/transform-factory";

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

    this.nodeTransform = this.outlineService.mouseOverSubject.getValue();
    if (this.nodeTransform) {
      const element = this.nodeTransform.tag as SVGGraphicsElement;
      this.transformation = this.transformFactory.getTransformForElement(
        element
      );

      if (this.transformation) {
        this.transformation.beginMouseTransaction(event.getDOMPoint());
      }
    }
    // Use when accurate selection will be implemented, or to select groups:
    /* if (!this.nodeTransform) {
      this.nodeTransform = this.getIntersects(true) as TreeNode;
    } */
  }

  getIntersects(onlyFirst: boolean = false): TreeNode[] | TreeNode {
    const matrix = this.viewportService.getCTM();
    const transformed = this.viewportService.matrixRectTransform(
      this.selectionRect,
      matrix
    );

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

  angle(p1: DOMPoint, p2: DOMPoint): number {
    return (Math.atan2(p1.y - p2.y, p2.x - p1.x) * 180) / Math.PI;
  }

  onWindowMouseMove(event: MouseEventArgs) {
    if (!this.nodeTransform) {
      super.onWindowMouseMove(event);
    } else if (this.containerRect) {
      const element = this.nodeTransform.tag as SVGGraphicsElement;
      if (element) {
        // this.rotateByMouseMove(event, element);
        this.moveByMouse(event, element);
      }
    }
  }

  moveByMouse(event: MouseEventArgs, element: SVGGraphicsElement) {
    const screenPos = event.getDOMPoint();

    // this.rotateByMouseMove(event,element );
    if (this.transformation) {
      // this.transformation.moveByMouse(screenPos);
    }
  }
  rotateByMouseMove(event: MouseEventArgs, element: SVGGraphicsElement) {
    const ctm = element.getCTM();
    const box = element.getBBox();
    let centerBox = new DOMPoint(box.x + box.width / 2, box.y + box.height / 2);

    const tranformedCenter = centerBox.matrixTransform(ctm);
    let deg = -this.angle(tranformedCenter, this.getMousePos(event));
    if (this.lastDeg === null) {
      this.lastDeg = deg;
      // TODO: show current bounds
      return;
    }
    if (false) {
      // TODO: set only rotation if nothing else is set.
      /* if (element.transform.baseVal.numberOfItems === 0) {
        const rotation = element.ownerSVGElement.createSVGTransform();
        rotation.setRotate(set, centerBox.x, centerBox.y);
        element.transform.baseVal.appendItem(rotation);
        return;
      } else if (element.transform.baseVal.numberOfItems === 1) {
        const rotation = element.transform.baseVal[0] as SVGTransform;
        if (rotation.type === rotation.SVG_TRANSFORM_ROTATE) {
          rotation.setRotate(set, centerBox.x, centerBox.y);
          return;
        }
      } */
    }
    const degoffset = deg - this.lastDeg;
    this.lastDeg = deg;
    deg = degoffset;

    const transform =
      element.transform.baseVal.consolidate() ||
      element.ownerSVGElement.createSVGTransform();
    centerBox = centerBox.matrixTransform(transform.matrix);

    const matrix = element.ownerSVGElement
      .createSVGMatrix()
      .translate(centerBox.x, centerBox.y)
      .rotate(deg, 0, 0)
      .translate(-centerBox.x, -centerBox.y)
      .multiply(transform.matrix);

    this.viewportService.setCTMForElement(element, matrix);
  }

  /**
   * Override
   */
  selectionUpdate(event: MouseEventArgs) {
    if (!this.selectionRect) {
      return;
    }

    const selected = this.getIntersects() as TreeNode[];
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
   * Override
   */
  selectionEnded(e: MouseEventArgs) {}
}
