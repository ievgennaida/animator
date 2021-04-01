import { Injectable } from "@angular/core";
import { AdornerTypeUtils } from "src/app/models/adorner-type-utils";
import { CursorType } from "src/app/models/cursor-type";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { AdornerPointType } from "../../models/adorner-point-type";
import { AdornerType } from "../../models/adorner-type";
import { MouseEventArgs } from "../../models/mouse-event-args";
import { AdornersService } from "../adorners-service";
import { ContextMenuService } from "../context-menu.service";
import { CursorService } from "../cursor.service";
import { IntersectionService } from "../intersection.service";
import { MouseOverService } from "../mouse-over.service";
import { NotificationService } from "../notification.service";
import { OutlineService } from "../outline.service";
import { BoundsRenderer } from "../renderers/bounds.renderer";
import { MouseOverRenderer } from "../renderers/mouse-over.renderer";
import { SelectionService } from "../selection.service";
import { ChangeStateMode } from "../state-subject";
import { AutoPanService } from "./auto-pan-service";
import { BaseTool } from "./base.tool";
import { SelectionRectTracker } from "./selection-rect-tracker";
import { TransformsService } from "./transforms.service";

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
  lastDeg: number | null = null;
  lastUsedArgs: MouseEventArgs | null = null;
  lastShowBBoxState: boolean | null = null;
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
    protected selectionTracker: SelectionRectTracker,
    protected notification: NotificationService
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
    // don't allow to transform when right click:
    if (event.rightClicked()) {
      this.cleanUp();
      return;
    }
    this.selectionTracker.start(event);
    const startedNode = this.mouseOverService.getValue();
    let handle = this.mouseOverService.mouseOverHandle;
    if (startedNode || handle) {
      if (!handle && this.adornersService?.selectionAdorner?.enabled) {
        // Move selection data
        handle = new HandleData();
        handle.adorner = this.adornersService?.selectionAdorner;
        handle.handle = AdornerPointType.none;
      }

      this.startedHandle = handle;
      if (handle) {
        if (handle?.adorner?.type !== AdornerType.selection) {
          this.startedNode = handle.adorner.node;
        }
      } else {
        this.startedNode = startedNode;
      }

      if (this.startedNode && !this.startedNode.selected) {
        return;
      }

      const nodesToSelect = this.selectionService
        .getTopSelectedNodes()
        .filter((p) => p.allowTransform);
      const transformMode = AdornerTypeUtils.getTransformationMode(handle);
      this.transformsService.start(
        transformMode,
        nodesToSelect,
        event.getDOMPoint(),
        handle
      );
    }
  }

  onActivate() {
    this.adornersService.showBBoxHandles = true;
    this.mouseOverRenderer.resume();
    this.notification.showFooterMessage("[Shift] - Append [CTRL] - Toggle");
  }
  onDeactivate() {
    super.onDeactivate();
    this.cleanUp();
    this.adornersService.showBBoxHandles = true;
    this.notification.hideFooterMessage();
  }
  cleanUp() {
    this.lastUsedArgs = null;
    this.lastDeg = null;
    this.startedNode = null;
    this.startedHandle = null;
    if (this.lastShowBBoxState !== null) {
      this.adornersService.showBBoxHandles = this.lastShowBBoxState;
    } else {
      this.adornersService.showBBoxHandles = true;
    }
    this.mouseOverRenderer.resume();
    if (this.transformsService.isActive()) {
      this.transformsService.cancel();
    }
    this.selectionTracker.stop();
    this.autoPanService.stop();
    this.mouseOverService.leaveHandle();
    this.selectionService.deselectAdorner();
    this.boundsRenderer.invalidate();
    this.lastShowBBoxState = null;
  }

  /**
   * Override.
   */
  onWindowMouseMove(event: MouseEventArgs) {
    this.lastUsedArgs = event;
    if (this.transformsService.isActive()) {
      // Don't allow to move when left was released.
      // this is missed blur event:
      if (!event.leftClicked()) {
        this.cleanUp();
        return;
      }
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
        this.cursor.setCursor(CursorType.notAllowed);
      } else {
        let handle: HandleData | null = null;
        if (this.selectionTracker.selectionRectStarted()) {
          this.lastShowBBoxState = this.adornersService.showBBoxHandles;
          // Don't show bbox handles when selection rect started.
          this.adornersService.showBBoxHandles = false;
        } else {
          if (this.lastShowBBoxState !== null) {
            this.adornersService.showBBoxHandles = this.lastShowBBoxState;
          }
          handle = this.intersectionService.getAdornerHandleIntersection(
            event.screenPoint
          );
          if (!handle) {
            this.mouseOverService.leaveHandle();
          } else if (!this.mouseOverService.isMouseOverHandle(handle)) {
            this.mouseOverService.setMouseOverHandle(handle);
          }
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
    // Simulate and update current state again after the cleanup that was done during the mouse up commit.
    this.onWindowMouseMove(e);
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
      this.transformsService.isChanged()
    ) {
      this.transformsService.commit();
      return;
    } else {
      this.transformsService.cancel();
    }

    let mode = ChangeStateMode.normal;
    if (event.ctrlKey) {
      mode = ChangeStateMode.revert;
    } else if (event.shiftKey) {
      mode = ChangeStateMode.append;
    }

    if (this.selectionService.selectedAdorner !== AdornerPointType.none) {
      this.selectionService.deselectAdorner();
      return;
    }
    if (this.selectionTracker.click) {
      // select the same node when mouse over one of the handles.
      const overTreeNodeHandle = this.mouseOverService.mouseOverHandle?.adorner
        ?.node;
      // select mouse over node.
      const mouseOverTransform = this.mouseOverService.getValue();
      const toSelect = overTreeNodeHandle || mouseOverTransform;
      this.selectionService.setSelected(toSelect, mode);
    } else if (this.selectionTracker.selectionRectStarted()) {
      const selected = this.intersectionService
        .getIntersects(this.selectionTracker.getScreenRect())
        .filter((p) => p.allowTransform);
      this.selectionService.setSelected(selected, mode);
    }
  }
}
