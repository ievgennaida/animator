import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { CursorType } from "src/app/models/cursor-type";
import { HandleData } from "src/app/models/handle-data";
import {
  PathDataHandle,
  PathDataHandleType,
} from "src/app/models/path-data-handle";
import { TreeNode } from "src/app/models/tree-node";
import { consts } from "src/environments/consts";
import { AdornerType, AdornerTypeUtils } from "../../models/adorner-type";
import { MouseEventArgs } from "../../models/mouse-event-args";
import { TransformationMode } from "../../models/transformation-mode";
import { AdornersService } from "../adorners-service";
import { ContextMenuService } from "../context-menu.service";
import { CursorService } from "../cursor.service";
import { IntersectionService } from "../intersection.service";
import { MouseOverService } from "../mouse-over.service";
import { NotificationService } from "../notification.service";
import { OutlineService } from "../outline.service";
import { BoundsRenderer } from "../renderers/bounds.renderer";
import { MouseOverRenderer } from "../renderers/mouse-over.renderer";
import { PathRenderer } from "../renderers/path.renderer";
import { SelectionService } from "../selection.service";
import { ChangeStateMode } from "../state-subject";
import { AutoPanService } from "./auto-pan-service";
import { SelectionRectTracker } from "./selection-rect-tracker";
import { SelectionTool } from "./selection.tool";
import { TransformsService } from "./transforms.service";

export enum PathDirectSelectionToolMode {
  /**
   * Select and manipulate nodes.
   */
  Select,
  /**
   * Add new path data nodes.
   */
  Add,
  /**
   * Remove existing path data nodes.
   */
  Remove,
}
@Injectable({
  providedIn: "root",
})
/**
 * Path direct path data selection
 */
export class PathDirectSelectionTool extends SelectionTool {
  iconName = "navigation_outline";
  modeSubject = new BehaviorSubject<PathDirectSelectionToolMode>(
    PathDirectSelectionToolMode.Select
  );

  constructor(
    // TODO: decouple, use selection as reference
    private pathRenderer: PathRenderer,
    transformsService: TransformsService,
    intersectionService: IntersectionService,
    selectionService: SelectionService,
    boundsRenderer: BoundsRenderer,
    outlineService: OutlineService,
    mouseOverService: MouseOverService,
    mouseOverRenderer: MouseOverRenderer,
    cursor: CursorService,
    contextMenu: ContextMenuService,
    adornersService: AdornersService,
    autoPanService: AutoPanService,
    selectionTracker: SelectionRectTracker,
    notification: NotificationService
  ) {
    super(
      transformsService,
      intersectionService,
      selectionService,
      boundsRenderer,
      outlineService,
      mouseOverService,
      mouseOverRenderer,
      cursor,
      contextMenu,
      adornersService,
      autoPanService,
      selectionTracker,
      notification
    );
  }
  get mode(): PathDirectSelectionToolMode {
    return this.modeSubject.getValue();
  }

  set mode(val: PathDirectSelectionToolMode) {
    if (this.mode !== val) {
      this.modeSubject.next(val);
      this.resolveCursor();
    }
  }
  prevMouseUpArgs: MouseEventArgs;
  resolveCursor() {
    let mode = CursorType.Default;
    if (this.mode === PathDirectSelectionToolMode.Add) {
      mode = CursorType.Copy;
    }
    this.cursor.setDefaultCursor(mode);
  }
  /**
   * Override
   */
  onDeactivate() {
    this.cursor.setDefaultCursor(CursorType.Default);
    this.mouseOverRenderer.enableDrawPathOutline = false;
    this.pathRenderer.suspend();
    this.pathRenderer.clear();
    super.onDeactivate();
    this.cleanUp();
  }
  /**
   * Override
   */
  onActivate() {
    this.resolveCursor();
    this.mouseOverRenderer.enableDrawPathOutline = true;
    this.pathRenderer.invalidate();
    this.pathRenderer.resume();
    super.onActivate();
    this.resolveMessage();
  }
  resolveMessage() {
    const nodes = this.mouseOverService.pathDataSubject.getValues();
    let set = false;
    nodes.forEach((p) => {
      if (p.command) {
        this.notification.showFooterMessage(
          `(${p.commandIndex}) ${p?.command?.type} - ${p?.command.values}`
        );
        set = true;
      }
    });
    if (!set) {
      this.notification.showFooterMessage("[Shift] - Append [CTRL] - Toggle");
    }
  }
  /**
   * Override
   */
  onViewportContextMenu(event: MouseEventArgs) {
    /* const startedNode = this.outlineService.mouseOverSubject.getValue();
    if (startedNode) {
      this.contextMenu.open(event.args as MouseEvent, startedNode);
    }*/
    super.onViewportContextMenu(event);
  }

  /**
   * Override
   */
  onViewportMouseDown(event: MouseEventArgs) {
    // don't allow to transform on right click:
    if (event.rightClicked()) {
      // TODO: context menu for a specific point or selected points
      this.cleanUp();
      return;
    }
    this.selectionTracker.start(event);
    const isAltMode = event.ctrlKey || event.shiftKey;

    if (isAltMode) {
      return;
    }

    let handle = this.mouseOverService.mouseOverHandle;
    if (handle) {
      const selectedHandles = this.selectionService.pathDataSubject.getValues();
      let nodesToSelect = this.getHandleNodes(selectedHandles);

      const transformMode = AdornerTypeUtils.getTransformationMode(handle);
      if (nodesToSelect.length === 0) {
        nodesToSelect = this.selectionService.getTopSelectedNodes();
      } else {
        const data = new HandleData();
        data.pathDataHandles = selectedHandles;
        data.adorner = handle.adorner;
        data.handle = handle.handle;
        handle = data;
      }
      this.transformsService.start(
        transformMode,
        nodesToSelect,
        event.getDOMPoint(),
        handle
      );
      this.startedNode = this.mouseOverService.getValue();
      if (this.startedNode && nodesToSelect.length > 0) {
        this.startedNode = nodesToSelect[0];
      }
      this.startedHandle = handle;
    } else {
      const overPathDataHandles = this.mouseOverService.pathDataSubject.getHandles();
      if (!overPathDataHandles || overPathDataHandles.length === 0) {
        // Start click or rect transform, deselect all selected
        this.selectionService.pathDataSubject.setNone();
      } else {
        if (this.mode === PathDirectSelectionToolMode.Add) {
        } else {
          // Get transform path data handles to be moved
          const handles = this.getTransformHandles();
          // Transform one handle
          if (handles && handles.length > 0) {
            const pointHandles = handles.filter(
              (p) => p.commandType === PathDataHandleType.Point
            );
            if (pointHandles.length > 0) {
              // Ensure that returned points are selected:
              this.selectionService.pathDataSubject.change(
                pointHandles,
                ChangeStateMode.Normal
              );
            }

            this.startedNode = handles[0].node;
            const nodesToSelect = this.getHandleNodes(handles);
            const data = new HandleData();
            data.pathDataHandles = handles;
            this.transformsService.start(
              TransformationMode.Translate,
              nodesToSelect,
              event.getDOMPoint(),
              data
            );
          }
        }
      }
    }
  }

  /**
   * Get selected path data tree nodes:
   */
  getHandleNodes(handles: PathDataHandle[] | null): TreeNode[] {
    const nodesToSelect: TreeNode[] = [];
    if (!handles) {
      return nodesToSelect;
    }

    handles.forEach((pathDataHandle) => {
      if (pathDataHandle && !nodesToSelect.includes(pathDataHandle.node)) {
        nodesToSelect.push(pathDataHandle.node);
      }
    });
    return nodesToSelect;
  }
  /**
   * Get list of the path data points, control points or curves to be transformed.
   */
  getTransformHandles(): PathDataHandle[] | null {
    // Mouse over handles
    const overHandles = this.mouseOverService.pathDataSubject.getHandles();
    const transformHandle = overHandles.find(
      (p) => p.commandType !== PathDataHandleType.Point
    );
    // Mouse over special handle. not a point, allow to transform by non point handles:
    if (transformHandle) {
      return [transformHandle];
    }

    // Move over point, find all selected point and move together.
    const mouseOverPoints = overHandles.filter(
      (p) => p.commandType === PathDataHandleType.Point
    );

    const selectedPoints = this.selectionService.pathDataSubject.getValues();
    if (
      mouseOverPoints.find((mouseOverPoint) =>
        selectedPoints.find((p) => p.equals(mouseOverPoint))
      )
    ) {
      // Move all selected points when mouse over one of them.
      return selectedPoints;
    } else {
      return mouseOverPoints;
    }
  }
  /**
   * Override
   */
  cleanUp() {
    super.cleanUp();
  }

  /**
   * Override
   */
  onWindowMouseMove(event: MouseEventArgs) {
    if (this.selectionTracker.rect && !this.selectionTracker.click) {
      this.mouseOverRenderer.suspend(true);
    }

    super.onWindowMouseMove(event);
    // Cancel when transformation transaction is started.
    if (this.transformsService.isActive()) {
      // Don't allow to move when left was released.
      // this is missed blur event:
      if (!event.leftClicked()) {
        this.cleanUp();
        return;
      }
      return;
    } else if (this.selectionTracker.isActive()) {
      // this simulation of a missed blur event:
      if (!event.leftClicked()) {
        this.cleanUp();
        return;
      }
    }
    const handle = this.mouseOverService.mouseOverHandle;
    // Mouse is already over some bbox handles:
    if (handle && handle.type === AdornerType.PathDataSelection) {
      this.mouseOverService.pathDataSubject.change([], ChangeStateMode.Normal);
      return;
    }

    const screenPos = event.getDOMPoint();
    const nodes = this.selectionService.getSelected();
    const overPoints =
      this.intersectionService.intersectPathDataHandles(
        nodes,
        this.selectionTracker.getScreenRect(),
        screenPos
      ) || [];

    // No handles selected, select curve if not a rectangular selection:
    if (
      this.mode !== PathDirectSelectionToolMode.Remove &&
      overPoints.length === 0 &&
      !this.selectionTracker.isActive()
    ) {
      let accuracy = 2;
      if (this.mode !== PathDirectSelectionToolMode.Select) {
        accuracy = consts.addNewPointAccuracy;
      }

      const nearest = this.intersectionService.getMouseOverPathCurve(
        nodes,
        screenPos,
        accuracy
      );
      if (nearest) {
        let handleMode = PathDataHandleType.Curve;
        if (this.mode === PathDirectSelectionToolMode.Add) {
          handleMode = PathDataHandleType.AddPoint;
        }
        const curve = new PathDataHandle(
          nearest.node,
          nearest.pathData,
          nearest.commandIndex,
          handleMode,
          nearest.point
        );
        overPoints.push(curve);
      }
    }
    this.mouseOverService.pathDataSubject.change(
      overPoints,
      ChangeStateMode.Normal
    );

    this.resolveMessage();
  }

  /**
   * Override
   */
  selectionEnded(event: MouseEventArgs) {
    if (this.transformsService.isActive()) {
      if (this.transformsService.isChanged()) {
        this.transformsService.commit();
        return;
      } else {
        this.transformsService.cancel();
      }
    }

    const screenPos = event.getDOMPoint();
    const nodes = this.selectionService.getSelected();

    // When no node are selected to select path data
    // allow to select nodes by rect selector:
    if (
      !nodes ||
      (nodes.length === 0 && this.selectionTracker.selectionRectStarted())
    ) {
      super.selectionEnded(event);
      return;
    }
    if (this.mode === PathDirectSelectionToolMode.Add) {
      const addNewIcon = this.mouseOverService.pathDataSubject
        .getValues()
        .filter((p) => p.commandType === PathDataHandleType.AddPoint);
      if (addNewIcon && addNewIcon.length > 0) {
      }
      return;
    }
    const selectorRect = this.selectionTracker.click
      ? null
      : this.selectionTracker.getScreenRect();
    const overPoints = this.intersectionService.intersectPathDataHandles(
      nodes,
      selectorRect,
      screenPos
    );

    let changeStateMode = ChangeStateMode.Normal;
    if (this.selectionTracker.click) {
      if (!overPoints || overPoints.length === 0) {
        let accuracy = 2;
        if (this.mode !== PathDirectSelectionToolMode.Select) {
          accuracy = consts.addNewPointAccuracy;
        }

        const nearest = this.intersectionService.getMouseOverPathCurve(
          nodes,
          screenPos,
          accuracy
        );
        if (nearest && event.isDoubleClick && this.selectionTracker.click) {
          // double click
          // TODO: add new point
          console.log("TODO: double click");
        }
        this.prevMouseUpArgs = event;
        // Select item if there is no click on curve
        if (!nearest) {
          super.selectionEnded(event);
        }
      }
      if (event.shiftKey || event.ctrlKey) {
        changeStateMode = ChangeStateMode.Revert;
      }
    } else {
      changeStateMode = ChangeStateMode.Append;
    }
    this.pathRenderer.suspend();
    this.mouseOverService.pathDataSubject.setNone();
    this.selectionService.pathDataSubject.change(overPoints, changeStateMode);

    this.pathRenderer.resume();
    this.cleanUp();
  }
}
