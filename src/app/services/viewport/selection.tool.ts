import { Injectable } from "@angular/core";
import { CursorType } from "src/app/models/cursor-type";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { MouseEventArgs } from "../../models/mouse-event-args";
import { AdornersService } from "../adorners-service";
import { ContextMenuService } from "../context-menu.service";
import { CursorService } from "../cursor.service";
import { IntersectionService } from "../intersection.service";
import { LoggerService } from "../logger.service";
import { MouseOverService } from "../mouse-over.service";
import { OutlineService } from "../outline.service";
import { SelectionService } from "../selection.service";
import { ChangeStateMode } from "../state-subject";
import { ViewService } from "../view.service";
import { AdornerType, AdornerTypeUtils } from "./adorners/adorner-type";
import { BaseSelectionTool } from "./base-selection.tool";
import { PanTool } from "./pan.tool";
import { BoundsRenderer } from "./renderers/bounds.renderer";
import { MouseOverRenderer } from "./renderers/mouse-over.renderer";
import { SelectorRenderer } from "./renderers/selector.renderer";
import {
  MatrixTransform,
  TransformationMode,
} from "./transformations/matrix-transform";
import { TransformsService } from "./transformations/transforms.service";

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
  constructor(
    protected transformsService: TransformsService,
    viewService: ViewService,
    logger: LoggerService,
    panTool: PanTool,
    selectorRenderer: SelectorRenderer,
    protected intersectionService: IntersectionService,
    protected selectionService: SelectionService,
    protected boundsRenderer: BoundsRenderer,
    protected outlineService: OutlineService,
    protected mouseOverService: MouseOverService,
    protected mouseOverRenderer: MouseOverRenderer,
    protected cursor: CursorService,
    protected contextMenu: ContextMenuService,
    protected adornersService: AdornersService
  ) {
    super(selectorRenderer, viewService, logger, panTool);
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
      this.startedNode = handle ? handle.adorner.node : startedNode;
      if (this.startedNode && !this.startedNode.selected) {
        return;
      }

      const nodesToSelect = this.selectionService
        .getSelected()
        .map((item) => this.selectionService.getTopSelectedNode(item))
        .filter((value, index, self) => value && self.indexOf(value) === index);
      const screenPoint = event.getDOMPoint();
      const transactions = this.transformsService.prepareTransactions(
        nodesToSelect,
        screenPoint,
        handle
      );
      this.transformsService.start(transactions);
    }
    // Use when accurate selection will be implemented, or to select groups:
    /* if (!this.startedNode) {
      this.startedNode = this.getIntersects(true) as TreeNode;
    } */
  }

  isOverNode(): boolean {
    // TODO: bad place
    const startedNode = this.mouseOverService.getValue();
    const handle = this.mouseOverService.mouseOverHandle;
    return !handle && !!startedNode;
  }

  onDeactivate() {
    super.onDeactivate();
    this.cleanUp();
  }
  cleanUp() {
    this.mouseOverRenderer.resume();
    this.lastDeg = null;
    this.transformsService.cancel();
    this.startedNode = null;
    this.startedHandle = null;
    super.cleanUp();
    this.cursor.setCursor(CursorType.Default);
    this.mouseOverService.leaveHandle();
    this.selectionService.deselectAdorner();
  }

  onWindowMouseMove(event: MouseEventArgs) {
    this.trackMousePos(event);
    if (this.transformsService.isActive()) {
      this.cursor.setHandleCursor(this.startedHandle, event.screenPoint);
      // Don't draw mouse over when transformation is started:
      this.mouseOverRenderer.suspend(true);
      this.moveByMouse(event);
    } else {
      if (this.startedNode) {
        // Not allowed to click on a new node and drag.
        // Mouse should be released in order to avoid drag by mistake.
        this.cursor.setCursor(CursorType.NotAllowed);
      } else {
        const adorners = this.adornersService.getActiveAdorners();
        const adornersWithActiveHandles = adorners.filter((p) =>
          this.adornersService.isAdornerHandlesActive(p)
        );
        const handle = this.intersectionService.getAdornerHandleIntersection(
          event.screenPoint,
          adornersWithActiveHandles
        );
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
    if (this.transformsService.isActive()) {
      if (this.currentArgs) {
        this.moveByMouse(this.currentArgs, false);
      }
    }
    return isDone;
  }
  moveByMouse(event: MouseEventArgs, allowPan = true) {
    if (this.transformsService.isActive()) {
      const screenPos = event.getDOMPoint();

      this.boundsRenderer.runSuspended(() => {
        const isChanged = this.transformsService.transformByMouse(screenPos);

        if (isChanged && allowPan) {
          this.currentArgs = event;
          this.startAutoPan();
        }
      });
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
    this.stopAutoPan();
    // No action if transform transaction was running.
    if (
      this.transformsService.isActive() &&
      this.transformsService.isChanged() &&
      !this.click
    ) {
      return;
    }

    let mode = ChangeStateMode.Normal;
    if (event.ctrlKey) {
      mode = ChangeStateMode.Revert;
    } else if (event.shiftKey) {
      mode = ChangeStateMode.Append;
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
