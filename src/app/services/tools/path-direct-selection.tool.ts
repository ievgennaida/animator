import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { AdornerTypeUtils } from "src/app/models/adorner-type-utils";
import { CursorType } from "src/app/models/cursor-type";
import { HandleData } from "src/app/models/handle-data";
import { PathDataHandle } from "src/app/models/path-data-handle";
import { PathDataHandleType } from "src/app/models/path-data-handle-type";
import { PathDirectSelectionToolMode } from "src/app/models/path-direct-selection-tool-mode";
import { TreeNode } from "src/app/models/tree-node";
import { consts } from "src/environments/consts";
import { AdornerType } from "../../models/adorner-type";
import { MouseEventArgs } from "../../models/mouse-event-args";
import { TransformationMode } from "../../models/transformation-mode";
import { AddPathNodesAction } from "../actions/path-actions/add-path-nodes-action";
import { AdornersService } from "../adorners-service";
import { CommandsExecutorService } from "../commands/commands-services/commands-executor-service";
import { RemoveSelectedCommand } from "../commands/remove-selected-command";
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
import { UndoService } from "../undo.service";
import { AutoPanService } from "./auto-pan-service";
import { SelectionRectTracker } from "./selection-rect-tracker";
import { SelectionTool } from "./selection.tool";
import { TransformsService } from "./transforms.service";

@Injectable({
  providedIn: "root",
})
/**
 * Path direct path data selection
 */
export class PathDirectSelectionTool extends SelectionTool {
  icon = "navigation_outline";
  modeSubject = new BehaviorSubject<PathDirectSelectionToolMode>(
    PathDirectSelectionToolMode.select
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
    notification: NotificationService,
    private removeSelectedCommand: RemoveSelectedCommand,
    private commandExecutorService: CommandsExecutorService,
    private undoService: UndoService
  ) {
    // TODO: decouple
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
      this.resolveBBoxVisibilityMode();
    }
    this.pathRenderer.drawMode = val;
  }
  resolveBBoxVisibilityMode() {
    if (this.mode === PathDirectSelectionToolMode.select) {
      // TODO: If mode to show bbox is enabled by the user settings.
      this.adornersService.showBBoxHandles = true;
    } else {
      this.adornersService.showBBoxHandles = false;
    }
  }

  resolveCursor() {
    let mode = CursorType.default;
    if (this.mode === PathDirectSelectionToolMode.add) {
      mode = CursorType.copy;
    }
    this.cursor.setDefaultCursor(mode);
  }
  /**
   * Override
   */
  onDeactivate() {
    super.onDeactivate();
    this.cursor.setDefaultCursor(CursorType.default);
    this.mouseOverRenderer.enableDrawPathOutline = false;
    this.pathRenderer.suspend();
    this.pathRenderer.clear();
    this.cleanUp();
  }
  /**
   * Override
   */
  onActivate() {
    super.onActivate();
    this.resolveCursor();
    this.mouseOverRenderer.enableDrawPathOutline = true;
    this.pathRenderer.invalidate();
    this.pathRenderer.resume();
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
    const allowRectSelect = this.mode === PathDirectSelectionToolMode.select;
    this.selectionTracker.start(event, allowRectSelect);
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
      const overPathDataHandles =
        this.mouseOverService.pathDataSubject.getHandles();
      if (!overPathDataHandles || overPathDataHandles.length === 0) {
        // Start click or rect transform, deselect all selected
        this.selectionService.pathDataSubject.setNone();
      } else {
        if (this.mode === PathDirectSelectionToolMode.add) {
        } else {
          // Get transform path data handles to be moved
          const handles = this.getTransformHandles();
          // Transform one handle
          if (handles && handles.length > 0) {
            const pointHandles = handles.filter(
              (p) => p.type === PathDataHandleType.point
            );
            if (pointHandles.length > 0) {
              // Ensure that returned points are selected:
              this.selectionService.pathDataSubject.change(
                pointHandles,
                ChangeStateMode.normal
              );
            }

            this.startedNode = handles[0].node;
            const nodesToSelect = this.getHandleNodes(handles);
            const data = new HandleData();
            data.pathDataHandles = handles;
            this.transformsService.start(
              TransformationMode.translate,
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
      (p) => p.type !== PathDataHandleType.point
    );
    // Mouse over special handle. not a point, allow to transform by non point handles:
    if (transformHandle) {
      return [transformHandle];
    }

    // Move over point, find all selected point and move together.
    const mouseOverPoints = overHandles.filter(
      (p) => p.type === PathDataHandleType.point
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
    this.resolveBBoxVisibilityMode();
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
    if (handle && handle.type === AdornerType.pathDataSelection) {
      this.mouseOverService.pathDataSubject.change([], ChangeStateMode.normal);
      return;
    }

    const screenPos = event.getDOMPoint();
    const overPoints = this.getMouseOverHandles(screenPos);

    this.mouseOverService.pathDataSubject.change(
      overPoints,
      ChangeStateMode.normal
    );

    this.resolveMessage();
  }
  getMouseOverHandles(screenPos: DOMPoint): PathDataHandle[] {
    const nodes = this.selectionService.getSelected();
    const selector = this.selectionTracker.selectionRectStarted()
      ? this.selectionTracker.getScreenRect()
      : screenPos;

    const includeHandles = this.mode === PathDirectSelectionToolMode.select;
    const overPoints =
      this.intersectionService.intersectPathDataHandles(
        nodes,
        selector,
        includeHandles
      ) || [];

    // No handles selected, select curve if not a rectangular selection:
    if (
      overPoints.length === 0 &&
      !this.selectionTracker.selectionRectStarted()
    ) {
      let accuracy = 2;
      if (this.mode !== PathDirectSelectionToolMode.select) {
        accuracy = consts.addNewPointAccuracy;
      }

      const nearest = this.intersectionService.getMouseOverPathCurve(
        nodes,
        screenPos,
        accuracy
      );
      if (nearest) {
        this.pathRenderer.debugHandle = nearest;
        const handleMode = PathDataHandleType.curve;
        const curve = new PathDataHandle(
          nearest.node,
          nearest.command,
          handleMode,
          nearest.point
        );
        overPoints.push(curve);
      }
    }

    return overPoints;
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
    const overPoints = this.getMouseOverHandles(screenPos);
    let changeStateMode = ChangeStateMode.normal;
    if (this.selectionTracker.click) {
      if (overPoints.length !== 0) {
        if (this.mode === PathDirectSelectionToolMode.select) {
          if (event.isDoubleClick && this.selectionTracker.click) {
            // double click
            // TODO: add new point
            console.log("TODO: double click");
          }
        } else if (this.mode === PathDirectSelectionToolMode.erase) {
          // Remove selected points:
          changeStateMode = ChangeStateMode.normal;
          this.selectionService.pathDataSubject.change(
            overPoints,
            changeStateMode
          );
          this.commandExecutorService.executeCommand(
            this.removeSelectedCommand
          );
        } else if (this.mode === PathDirectSelectionToolMode.add) {
          // Remove selected points:
          changeStateMode = ChangeStateMode.normal;
          this.selectionService.pathDataSubject.change(
            overPoints,
            changeStateMode
          );
          const selectedNodes = this.selectionService.pathDataSubject.getValues();
          const action = this.undoService.getAction(AddPathNodesAction);
          action.init(selectedNodes);
          this.undoService.startAction(action, true);
        }
      } else {
        super.selectionEnded(event);
      }
      if (event.shiftKey || event.ctrlKey) {
        changeStateMode = ChangeStateMode.revert;
      }
    } else {
      changeStateMode = ChangeStateMode.append;
    }
    this.pathRenderer.runSuspended(() => {
      this.mouseOverService.pathDataSubject.setNone();
      if (this.mode === PathDirectSelectionToolMode.select) {
        this.selectionService.pathDataSubject.change(
          overPoints,
          changeStateMode
        );
      }
      this.cleanUp();
    }, true);
  }
}
