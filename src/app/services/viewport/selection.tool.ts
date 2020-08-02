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
import {
  MatrixTransform,
  TransformationMode,
} from "./transformations/matrix-transform";
import { BoundsRenderer } from "./renderers/bounds.renderer";
import { MouseOverRenderer } from "./renderers/mouse-over.renderer";
import { SelectionService, SelectionMode } from "../selection.service";
import { IntersectionService } from "../intersection.service";
import { ContextMenuService } from "../context-menu.service";
import { AdornerType, AdornerTypeUtils } from "./adorners/adorner-type";
import { CursorType } from "src/app/models/cursor-type";

import { MouseOverService } from "../mouse-over.service";
import { HandleData } from "src/app/models/handle-data";

/**
 * Select elements by a mouse move move.
 */
@Injectable({
  providedIn: "root",
})
export class SelectionTool extends BaseSelectionTool {
  iconName = "navigation";
  cachedMouse: TreeNode | null = null;
  startedNode: TreeNode | null = null;
  startedHandle: HandleData | null = null;
  lastDeg: number = null;
  transformations: Array<MatrixTransform> = null;
  constructor(
    transformsService: TransformsService,
    viewService: ViewService,
    logger: LoggerService,
    panTool: PanTool,
    selectorRenderer: SelectorRenderer,
    protected intersectionService: IntersectionService,
    protected selectionService: SelectionService,
    protected boundsRenderer: BoundsRenderer,
    protected transformFactory: TransformsService,
    protected outlineService: OutlineService,
    protected mouseOverService: MouseOverService,
    protected mouseOverRenderer: MouseOverRenderer,
    protected cursor: CursorService,
    protected contextMenu: ContextMenuService
  ) {
    super(selectorRenderer, transformsService, viewService, logger, panTool);
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
    const handle = this.mouseOverService.mouseOverHandle;
    if (startedNode || handle) {
      this.startedHandle = handle;
      this.startedNode = handle ? handle.node : startedNode;
      if (!this.startedNode || !this.startedNode.selected) {
        return;
      }

      const nodesToSelect = this.selectionService
        .getSelected()
        .map((item) => this.selectionService.getTopSelectedNode(item))
        .filter((value, index, self) => value && self.indexOf(value) === index);

      const transformations = nodesToSelect.map((p) => {
        const transformation = this.transformFactory.getTransformForElement(p);

        const screenPoint = event.getDOMPoint();
        if (handle) {
          if (AdornerTypeUtils.isRotateAdornerType(handle.handles)) {
            if (p.allowRotate) {
              transformation.beginMouseRotateTransaction(screenPoint);
            }
          } else {
            if (p.allowResize) {
              transformation.beginHandleTransformation(handle, screenPoint);
            }
          }
        } else {
          transformation.beginMouseTransaction(screenPoint);
        }
        return transformation;
      });

      transformations.forEach((p) => {
        if (p.mode === TransformationMode.Translate) {
          p.moveByMouse(event.getDOMPoint());
        }
      });
      this.transformations = transformations;
    }
    // Use when accurate selection will be implemented, or to select groups:
    /* if (!this.startedNode) {
      this.startedNode = this.getIntersects(true) as TreeNode;
    } */
  }
  isOverNode(): boolean {
    const startedNode = this.mouseOverService.getValue();
    const handle = this.mouseOverService.mouseOverHandle;
    return !handle && !!startedNode;
  }

  cleanUp() {
    this.mouseOverRenderer.resume();
    this.lastDeg = null;
    this.transformations = null;
    this.startedNode = null;
    this.startedHandle = null;
    super.cleanUp();
    this.cursor.setCursor(CursorType.Default);
    this.mouseOverService.leaveHandle();
    this.selectionService.deselectAdorner();
  }

  onWindowMouseMove(event: MouseEventArgs) {
    if (this.startedNode && this.startedNode.selected && this.containerRect) {
      this.cursor.setHandleCursor(this.startedHandle, event.screenPoint);
      // Don't draw mouse over when transformation is started:
      this.mouseOverRenderer.suspend(true);
      this.moveByMouse(event);
    } else {
      if (this.startedNode) {
        this.cursor.setCursor(CursorType.NotAllowed);
      } else {
        const selectedNodes = this.selectionService.getSelected();
        const showHandles = this.boundsRenderer.isShowHandles();
        // TODO: general selection adorner.
        const handle = showHandles
          ? this.intersectionService.getAdornerHandleIntersection(
              event.screenPoint,
              selectedNodes
            )
          : null;
        if (!handle) {
          this.mouseOverService.leaveHandle();
        } else if (!this.mouseOverService.isMouseOverHandle(handle)) {
          this.mouseOverService.setMouseOverHandle(handle);
        }

        this.cursor.setHandleCursor(handle, event.screenPoint);
        if (!handle) {
          super.onWindowMouseMove(event);
        }
      }
    }
  }

  /**
   * Override
   */
  autoPan(mousePosition: DOMPoint, containerSize: DOMRect): boolean {
    // override the auto pan code to run it when translate operation is running.
    const isDone = super.autoPan(mousePosition, containerSize);
    if (this.transformations) {
      if (this.currentArgs) {
        this.moveByMouse(this.currentArgs, false);
      }
    }
    return isDone;
  }
  moveByMouse(event: MouseEventArgs, allowPan = true) {
    if (this.transformations) {
      const screenPos = event.getDOMPoint();
      try {
        this.boundsRenderer.suspend();
        let autoPan = false;
        this.transformations.forEach((p) => {
          if (p.mode === TransformationMode.Translate) {
            autoPan = true;
          }
          p.transformByMouse(screenPos);
        });
        if (autoPan && allowPan) {
          this.currentArgs = event;
          this.startAutoPan();
        }
      } finally {
        this.boundsRenderer.resume();
      }
    }
  }

  onPlayerMouseOut(event: MouseEventArgs) {
    // TODO: wrong place for this global event. Should be extracted.
    if (this.cachedMouse && this.cachedMouse.tag !== event.args.target) {
      const node = this.outlineService
        .getAllNodes()
        .find((p) => p.tag === event.args.target);
      this.mouseOverService.setMouseLeave(node);
    } else {
      this.mouseOverService.setMouseLeave(this.cachedMouse);
      this.cachedMouse = null;
    }
  }

  onPlayerMouseOver(event: MouseEventArgs) {
    const node = this.outlineService
      .getAllNodes()
      .find((p) => p.tag === event.args.target);
    if (!node) {
      return;
    }

    this.cachedMouse = node;
    this.mouseOverService.setMouseOver(node);
  }

  /**
   * Override
   */
  selectionEnded(event: MouseEventArgs) {
    if (this.transformations !== null && this.transformations.length > 0) {
      this.stopAutoPan();
      return;
    }
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
      const selected = this.intersectionService.getIntersects(
        this.selectionRect
      ) as TreeNode[];
      this.selectionService.setSelected(selected, mode);
    }
  }
}
