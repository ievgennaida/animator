import { MouseEventArgs } from "./mouse-event-args";
import { Injectable } from "@angular/core";
import { LoggerService } from "../logger.service";
import { ViewService } from "../view.service";
import { BaseSelectionTool } from "./base-selection.tool";
import { PanTool } from "./pan.tool";
import { TreeNode } from "src/app/models/tree-node";
import { OutlineService } from "../outline.service";
import { TransformsService } from "./transformations/transforms.service";
import { Utils } from "../utils/utils";
import { SelectorRenderer } from "./renderers/selector.renderer";
import { CursorService, CursorType } from "../cursor.service";
import { MatrixTransform } from "./transformations/matrix-transform";
import { BoundsRenderer } from "./renderers/bounds.renderer";
import { MouseOverRenderer } from "./renderers/mouse-over.renderer";
import { SelectionService, SelectionMode } from "../selection.service";
import { ContextMenuService } from "../context-menu.service";

/**
 * Select elements by a mouse move move.
 */
@Injectable({
  providedIn: "root",
})
export class SelectionTool extends BaseSelectionTool {
  iconName = "navigation";
  renderableElements: Array<TreeNode> = [];
  cachedMouse: TreeNode = null;
  startedNode: TreeNode = null;
  lastDeg: number = null;
  transformations: Array<MatrixTransform> = null;
  constructor(
    transformsService: TransformsService,
    viewService: ViewService,
    logger: LoggerService,
    panTool: PanTool,
    selectorRenderer: SelectorRenderer,
    private selectionService: SelectionService,
    private boundsRenderer: BoundsRenderer,
    private transformFactory: TransformsService,
    private outlineService: OutlineService,
    private mouseOverRenderer: MouseOverRenderer,
    private cursor: CursorService,
    private contextMenu: ContextMenuService
  ) {
    super(selectorRenderer, transformsService, viewService, logger, panTool);
    outlineService.flatList.subscribe((flatItems) => {
      this.renderableElements = flatItems;
    });
  }
  onViewportContextMenu(event: MouseEventArgs) {
    const startedNode = this.outlineService.mouseOverSubject.getValue();
    if (startedNode) {
      this.contextMenu.open(event.args as MouseEvent, startedNode);
    }
    super.onViewportContextMenu(event);
  }
  selectionStarted(event: MouseEventArgs) {
    this.lastDeg = null;
    super.selectionStarted(event);
    // dont allow to transfrom on right click:
    if (event.rightClicked()) {
      this.cleanUp();
      return;
    }
    const startedNode = this.outlineService.mouseOverSubject.getValue();
    if (startedNode) {
      this.startedNode = startedNode;
      if (!startedNode || !startedNode.selected) {
        return;
      }

      const nodesToSelect = this.selectionService
        .getSelected()
        .map((item) => this.getTopSelectedNode(item))
        .filter((value, index, self) => value && self.indexOf(value) === index);

      const transformations = nodesToSelect.map((p) => {
        const transformation = this.transformFactory.getTransformForElement(
          p.getElement()
        );
        transformation.beginMouseTransaction(event.getDOMPoint());
        return transformation;
      });

      transformations.forEach((p) => p.moveByMouse(event.getDOMPoint()));
      this.transformations = transformations;
    }
    // Use when accurate selection will be implemented, or to select groups:
    /* if (!this.startedNode) {
      this.startedNode = this.getIntersects(true) as TreeNode;
    } */
  }

  getIntersects(onlyFirst: boolean = false): TreeNode[] | TreeNode {
    const matrix = this.viewService.getCTM();
    const transformed = Utils.matrixRectTransform(this.selectionRect, matrix);

    let selected: TreeNode[] = null;
    if (this.renderableElements && this.renderableElements.length > 0) {
      for (let i = this.renderableElements.length - 1; i >= 0; i--) {
        const node = this.renderableElements[i];
        if (node) {
          try {
            const bounds = node.getBoundingClientRect();
            if (!bounds) {
              continue;
            }

            bounds.x -= this.containerRect.left;
            bounds.y -= this.containerRect.top;

            if (Utils.rectsIntersect(bounds, transformed)) {
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
    this.mouseOverRenderer.resume();
    this.lastDeg = null;
    this.startedNode = null;
    super.cleanUp();
    this.cursor.setCursor(CursorType.Default);
  }

  onWindowMouseMove(event: MouseEventArgs) {
    if (this.startedNode && this.startedNode.selected && this.containerRect) {
      if (!this.mouseOverRenderer.suspended) {
        this.mouseOverRenderer.suspend();
        // Dont draw mouse over when transformation is started:
        this.mouseOverRenderer.clear();
      }
      const element = this.startedNode.getElement();
      if (element) {
        // this.rotateByMouse(event, element);
        this.moveByMouse(event, element);
      }
    } else {
      if (this.startedNode) {
        this.cursor.setCursor(CursorType.NotAllowed);
      } else {
        super.onWindowMouseMove(event);
      }
    }
  }

  getTopSelectedNode(node: TreeNode) {
    if (!node.selected || !node.transformable) {
      return null;
    }

    let toReturn = node;
    while (node != null) {
      node = node.parent;
      if (node) {
        if (node.selected && node.transformable) {
          toReturn = node;
        } else if (!node.transformable) {
          break;
        }
      }
    }

    return toReturn;
  }

  moveByMouse(event: MouseEventArgs, element: SVGGraphicsElement) {
    if (this.transformations) {
      const screenPos = event.getDOMPoint();
      try {
        this.boundsRenderer.suspend();
        this.transformations.forEach((p) => p.transformByMouse(screenPos));
      } finally {
        this.boundsRenderer.resume();
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
        (p) => p.tag === event.args.target
      );
      this.outlineService.setMouseLeave(node);
    } else {
      this.outlineService.setMouseLeave(this.cachedMouse);
      this.cachedMouse = null;
    }
  }

  onPlayerMouseOver(event: MouseEventArgs) {
    const node = this.renderableElements.find(
      (p) => p.tag === event.args.target
    );
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
    let mode = SelectionMode.Normal;
    if (event.ctrlKey) {
      mode = SelectionMode.Revert;
    } else if (event.shiftKey) {
      mode = SelectionMode.Add;
    }

    if (this.click) {
      const mouseOverTransform = this.outlineService.mouseOverSubject.getValue();
      this.selectionService.setSelected(mouseOverTransform, mode);
    } else if (!this.startedNode) {
      const selected = this.getIntersects() as TreeNode[];
      this.selectionService.setSelected(selected, mode);
    }
  }
}
