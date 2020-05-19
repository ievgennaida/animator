import { MouseEventArgs } from "../../models/mouse-event-args";
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
import { CursorService } from "../cursor.service";
import { MatrixTransform } from "./transformations/matrix-transform";
import { BoundsRenderer } from "./renderers/bounds.renderer";
import { MouseOverRenderer } from "./renderers/mouse-over.renderer";
import { SelectionService, SelectionMode } from "../selection.service";
import { ContextMenuService } from "../context-menu.service";
import { AdornerType } from "./adorners/adorner-type";
import { CursorType } from "src/app/models/cursor-type";
import { consts } from "src/environments/consts";
import { AdornerData } from "./adorners/adorner-data";
import { MouseOverService } from "../mouse-over.service";

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
    private mouseOverService: MouseOverService,
    private mouseOverRenderer: MouseOverRenderer,
    private cursor: CursorService,
    private contextMenu: ContextMenuService
  ) {
    super(selectorRenderer, transformsService, viewService, logger, panTool);
    this.outlineService.flatList.subscribe((flatItems) => {
      this.renderableElements = flatItems;
    });
  }
  onViewportContextMenu(event: MouseEventArgs) {
    const startedNode = this.mouseOverService.mouseOverSubject.getValue();
    if (startedNode) {
      this.contextMenu.open(event.args as MouseEvent, startedNode);
    }
    super.onViewportContextMenu(event);
  }
  selectionStarted(event: MouseEventArgs) {
    this.lastDeg = null;
    super.selectionStarted(event);
    // don't allow to transform on right click:
    if (event.rightClicked()) {
      this.cleanUp();
      return;
    }
    const startedNode = this.mouseOverService.getValue();
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
        transformation.beginHandleTransformation(this.mouseOverService.handles);
        return transformation;
      });

      transformations.forEach((p) => p.moveByMouse(event.getDOMPoint()));
      this.transformations = transformations;
      if (this.mouseOverService.handles !== AdornerType.None) {
        this.selectionService.setSelectedAdorner(this.mouseOverService.handles);
      }
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
            this.logger.warn(`Cannot check intersection ${err}`);
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
    this.mouseOverService.setMouseLeaveHandle();
    this.selectionService.deselectAdorner();
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
        const data = this.getAdornerHandleIntersection(event.screenPoint);
        const handle = data[0];
        if (handle !== this.mouseOverService.handles) {
          this.mouseOverService.setMouseOverHandle(handle);
          if (handle === AdornerType.None) {
            this.cursor.setCursor(CursorType.Default);
          } else {
            this.cursor.setCursor(
              this.cursor.getCursorResize(data[1].getElementAdorner(), handle)
            );
          }
          this.boundsRenderer.invalidate();
        }
        if (handle === AdornerType.None) {
          super.onWindowMouseMove(event);
        }
      }
    }
  }
  getAdornerHandleIntersection(screenPoint: DOMPoint): [AdornerType, TreeNode] {
    let type: AdornerType = AdornerType.None;
    const selectedItems = this.selectionService.getSelected();
    const toReturn = selectedItems.find((node) => {
      const adorner = node.getElementAdorner();
      const elPoint = Utils.toElementPoint(node, screenPoint);
      const screenPointSize = Utils.getLength(
        Utils.toElementPoint(
          node,
          new DOMPoint(screenPoint.x + 1, screenPoint.y + 1)
        ),
        elPoint
      );

      //const v = Utils.getVector(elPoint, adorner.center, true);

      const intersects = this.intersectAdorner(
        adorner,
        elPoint,
        screenPointSize * consts.handleSize
      );
      if (type !== intersects && intersects !== AdornerType.None) {
        type = intersects;
        return true;
      }
    });

    return [type, toReturn];
  }
  intersectAdorner(
    adorner: AdornerData,
    point: DOMPoint,
    accuracy = 6
  ): AdornerType {
    let toReturn = AdornerType.None;
    let curLen = accuracy;
    // Find nearest point:
    adorner.points.forEach((adornerPoint, key) => {
      if (point) {
        const vect = Utils.getVector( adornerPoint, adorner.center, true);
        const movePoint = Utils.alongVector(adornerPoint, vect, accuracy);
        curLen = Utils.getLength(movePoint, point);
        if (curLen <= accuracy) {
          toReturn = key;
          accuracy = curLen;
        }
      }
    });

    return toReturn;
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
      this.mouseOverService.setMouseLeave(node);
    } else {
      this.mouseOverService.setMouseLeave(this.cachedMouse);
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
    this.mouseOverService.setMouseOver(node);
  }

  /**
   * override
   */
  selectionEnded(event: MouseEventArgs) {
    let mode = SelectionMode.Normal;
    if (event.ctrlKey) {
      mode = SelectionMode.Revert;
    } else if (event.shiftKey) {
      mode = SelectionMode.Append;
    }

    if (this.selectionService.selectedAdorner !== AdornerType.None) {
      this.selectionService.deselectAdorner();
      return;
    }

    if (this.click) {
      const mouseOverTransform = this.mouseOverService.getValue();
      this.selectionService.setSelected(mouseOverTransform, mode);
    } else if (!this.startedNode) {
      const selected = this.getIntersects() as TreeNode[];
      this.selectionService.setSelected(selected, mode);
    }
  }
}
