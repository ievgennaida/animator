import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import {
  PathDataHandle,
  PathDataHandleType,
} from "src/app/models/path-data-handle";
import { MouseEventArgs } from "../../models/mouse-event-args";
import { TransformationMode } from "../actions/transformations/transformation-mode";
import { AdornersService } from "../adorners-service";
import { ContextMenuService } from "../context-menu.service";
import { CursorService } from "../cursor.service";
import { IntersectionService } from "../intersection.service";
import { MouseOverService } from "../mouse-over.service";
import { OutlineService } from "../outline.service";
import { SelectionService } from "../selection.service";
import { ChangeStateMode } from "../state-subject";
import { AutoPanService } from "./auto-pan-service";
import { BoundsRenderer } from "./renderers/bounds.renderer";
import { MouseOverRenderer } from "./renderers/mouse-over.renderer";
import { PathRenderer } from "./renderers/path.renderer";
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
  iconName = "navigation_outline";
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
    selectionTracker: SelectionRectTracker
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
      selectionTracker
    );
  }

  /**
   * Override
   */
  onDeactivate() {
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
    this.mouseOverRenderer.enableDrawPathOutline = true;
    this.pathRenderer.invalidate();
    this.pathRenderer.resume();
    super.onActivate();
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
    const overHandles = this.mouseOverService.pathDataSubject.getHandles();
    if (!overHandles || overHandles.length === 0) {
      // Start click or rect transform, deselect all selected
      this.selectionService.pathDataSubject.setNone();
    } else {
      // Get transform path data handles to be moved
      const handles = this.getTransformHandles();
      // Transform one handle
      if (handles && handles.length > 0) {
        this.startedNode = handles[0].node;
        const nodesToSelect = [];
        handles.forEach((element) => {
          if (!nodesToSelect.includes(element.node)) {
            nodesToSelect.push(element.node);
          }
        });
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
  /**
   * Get list of the path data points, control points or curves to be transformed.
   */
  getTransformHandles(): PathDataHandle[] | null {
    const overHandles = this.mouseOverService.pathDataSubject.getHandles();
    const transformHandle = overHandles.find(
      (p) => p.commandType !== PathDataHandleType.Point
    );
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
      // Only mouse over is selected now.
      this.selectionService.pathDataSubject.change(mouseOverPoints);
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
      return;
    }

    const screenPos = event.getDOMPoint();
    const nodes = this.selectionService.getSelected();
    const overPoints =
      this.intersectionService.intersectPathDataHandles(
        nodes,
        this.selectionTracker.rect,
        screenPos
      ) || [];

    // No handles selected, select curve if not a rectangular selection:
    if (overPoints.length === 0 && !this.selectionTracker.rect) {
      const nearest = this.intersectionService.getMouseOverPathCurve(
        nodes,
        screenPos
      );
      if (nearest) {
        const curve = new PathDataHandle(
          nearest.node,
          nearest.commandIndex,
          PathDataHandleType.Curve
        );
        overPoints.push(curve);
      }
    }
    this.mouseOverService.pathDataSubject.change(
      overPoints,
      ChangeStateMode.Normal
    );
  }

  /**
   * Override
   */
  selectionEnded(event: MouseEventArgs) {
    if (this.transformsService.isActive()) {
      this.transformsService.commit();
      return;
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
    const overPoints = this.intersectionService.intersectPathDataHandles(
      nodes,
      this.selectionTracker.click ? null : this.selectionTracker.rect,
      screenPos
    );

    let changeStateMode = ChangeStateMode.Normal;
    if (this.selectionTracker.click) {
      if (!overPoints || overPoints.length === 0) {
        super.selectionEnded(event);
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
