import { Injectable } from "@angular/core";
import { CursorType } from "src/app/models/cursor-type";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { MouseEventArgs } from "../../models/mouse-event-args";
import { AdornersService } from "../adorners-service";
import { ContextMenuService } from "../context-menu.service";
import { CursorService } from "../cursor.service";
import { IntersectionService } from "../intersection.service";
import { MouseOverService } from "../mouse-over.service";
import { OutlineService } from "../outline.service";
import { SelectionService } from "../selection.service";
import { ChangeStateMode } from "../state-subject";
import { AdornerType } from "./adorners/adorner-type";
import { AutoPanService } from "./auto-pan-service";
import { BaseTool } from "./base.tool";
import { BoundsRenderer } from "./renderers/bounds.renderer";
import { MouseOverRenderer } from "./renderers/mouse-over.renderer";
import { SelectionRectTracker } from "./selection-rect-tracker";
import { TransformsService } from "./transformations/transforms.service";

/**
 * Select elements by a mouse move move.
 */
@Injectable({
  providedIn: "root",
})
export class SelectionTool extends BaseTool {
  iconName = "navigation";

  startedNode: TreeNode | null = null;
  startedHandle: HandleData | null = null;
  lastDeg: number = null;
  lastUsedArgs: MouseEventArgs | null = null;
  constructor(
    protected transformsService: TransformsService,
    protected intersectionService: IntersectionService,
    protected selectionService: SelectionService,
    protected boundsRenderer: BoundsRenderer,
    protected outlineService: OutlineService,
    protected mouseOverService: MouseOverService,
    protected mouseOverRenderer: MouseOverRenderer,
    protected cursor: CursorService,
    protected contextMenu: ContextMenuService,
    protected adornersService: AdornersService,
    protected autoPanService: AutoPanService,
    protected selectionTracker: SelectionRectTracker
  ) {
    super();
  }
  onViewportContextMenu(event: MouseEventArgs) {
    const startedNode = this.mouseOverService.mouseOverSubject.getValue();
    // Select node if clicked is not selected.
    // in other case run it for selection.
    if (startedNode && !startedNode.selected) {
      this.selectionService.setSelected(startedNode);
    }

    if (this.selectionService.getSelected().length > 0) {
      this.contextMenu.open(event.args as MouseEvent, startedNode);
    }
    super.onViewportContextMenu(event);
  }

  onViewportMouseDown(event: MouseEventArgs) {
    this.lastDeg = null;
    // don't allow to transform on right click:
    if (event.rightClicked()) {
      this.cleanUp();
      return;
    }
    this.selectionTracker.start(event);
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
  onActivate() {
    this.mouseOverRenderer.resume();
  }
  onDeactivate() {
    super.onDeactivate();
    this.cleanUp();
  }
  cleanUp() {
    this.lastUsedArgs = null;
    this.lastDeg = null;
    this.startedNode = null;
    this.startedHandle = null;
    this.mouseOverRenderer.resume();
    this.transformsService.cancel();
    this.selectionTracker.stop();
    this.autoPanService.stop();
    this.cursor.setCursor(CursorType.Default);
    this.mouseOverService.leaveHandle();
    this.selectionService.deselectAdorner();
  }

  /**
   * Override.
   */
  onWindowMouseMove(event: MouseEventArgs) {
    this.lastUsedArgs = event;
    if (this.transformsService.isActive()) {
      // Start transformation of the element by mouse
      this.cursor.setHandleCursor(this.startedHandle, event.screenPoint);
      // Don't draw mouse over when transformation is started:
      this.mouseOverRenderer.suspend(true);
      this.applyTransformationByMouseMove(event);
    } else {
      // Start element or adorner selection.
      if (this.startedNode) {
        // Not allowed to click on a new node and drag.
        // Mouse should be released in order to avoid drag by mistake, than happens often.
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
          this.selectionTracker.update(event);
          event.preventDefault();
        }
      }
    }
    const selectionRectVisible =
      this.selectionTracker.isActive() && !this.selectionTracker.click;
    if (selectionRectVisible || this.transformsService.isActive()) {
      this.autoPanService.update(event.clientX, event.clientY);
    }
  }

  applyTransformationByMouseMove(event: MouseEventArgs): boolean {
    if (!this.transformsService.isActive()) {
      return false;
    }
    const screenPos = event.getDOMPoint();
    let isChanged = false;
    this.boundsRenderer.runSuspended(() => {
      isChanged = this.transformsService.transformByMouse(screenPos);
    });
    return isChanged;
  }
  /**
   * Override.
   */
  onWindowBlur(e) {
    this.cleanUp();
  }

  /**
   * Override.
   */
  onWindowMouseUp(e: MouseEventArgs) {
    this.startSelectionEnd(e);
  }

  startSelectionEnd(e: MouseEventArgs) {
    try {
      this.selectionEnded(e);
    } finally {
      this.cleanUp();
    }
  }
  onScroll() {
    // Transform element when auto pan is running.
    if (
      this.lastUsedArgs &&
      this.selectionTracker.isActive() &&
      this.autoPanService.isActive() &&
      this.transformsService.isActive()
    ) {
      this.applyTransformationByMouseMove(this.lastUsedArgs);
    }
  }
  /**
   * On selection ended.
   */
  selectionEnded(event: MouseEventArgs) {
    this.autoPanService.stop();
    if (!this.selectionTracker.isActive()) {
      return;
    }
    // Update rect with current pos
    this.selectionTracker.update(event);
    // No action if transform transaction was running.
    // Transformation was applied, no need to do selection
    if (
      this.transformsService.isActive() &&
      this.transformsService.isChanged() &&
      !this.selectionTracker.click
    ) {
      this.transformsService.commit();
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

    if (this.selectionTracker.click) {
      const mouseOverTransform = this.mouseOverService.getValue();
      this.selectionService.setSelected(mouseOverTransform, mode);
    } else if (!this.startedNode) {
      const selected = this.intersectionService.getIntersects(
        this.selectionTracker.rect
      ) as TreeNode[];
      this.selectionService.setSelected(selected, mode);
    }
  }
}
