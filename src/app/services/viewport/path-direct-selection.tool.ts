import { Injectable } from "@angular/core";
import {
  PathDataHandle,
  PathDataHandleType,
} from "src/app/models/path-data-handle";
import { MouseEventArgs } from "../../models/mouse-event-args";
import { ContextMenuService } from "../context-menu.service";
import { CursorService } from "../cursor.service";
import { IntersectionService } from "../intersection.service";
import { LoggerService } from "../logger.service";
import { MouseOverService } from "../mouse-over.service";
import { OutlineService } from "../outline.service";
import { SelectionService } from "../selection.service";
import { ChangeStateMode } from "../state-subject";
import { ViewService } from "../view.service";
import { PanTool } from "./pan.tool";
import { BoundsRenderer } from "./renderers/bounds.renderer";
import { MouseOverRenderer } from "./renderers/mouse-over.renderer";
import { PathRenderer } from "./renderers/path.renderer";
import { SelectorRenderer } from "./renderers/selector.renderer";
import { SelectionTool } from "./selection.tool";
import { TransformsService } from "./transformations/transforms.service";
import { TransformationMode } from "./transformations/matrix-transform";
import { AdornerTypeUtils } from "./adorners/adorner-type";
import { PathTransform } from "./transformations/path-transform";
import { nullLayer } from "src/app/models/Lottie/layers/nullLayer";

@Injectable({
  providedIn: "root",
})
/**
 * Path direct selection
 */
export class PathDirectSelectionTool extends SelectionTool {
  svgMatrix: DOMMatrix = null;
  mouseDownPos: DOMPoint = null;
  iconName = "navigation_outline";
  constructor(
    private pathRenderer: PathRenderer,
    transformsService: TransformsService,
    viewService: ViewService,
    logger: LoggerService,
    panTool: PanTool,
    selectorRenderer: SelectorRenderer,
    intersectionService: IntersectionService,
    selectionService: SelectionService,
    boundsRenderer: BoundsRenderer,
    transformFactory: TransformsService,
    outlineService: OutlineService,
    mouseOverService: MouseOverService,
    mouseOverRenderer: MouseOverRenderer,
    cursor: CursorService,
    contextMenu: ContextMenuService
  ) {
    super(
      transformsService,
      viewService,
      logger,
      panTool,
      selectorRenderer,
      intersectionService,
      selectionService,
      boundsRenderer,
      transformFactory,
      outlineService,
      mouseOverService,
      mouseOverRenderer,
      cursor,
      contextMenu
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
  selectionStarted(event: MouseEventArgs) {
    // don't allow to transform on right click:
    if (event.rightClicked()) {
      // TODO: context menu for a specific point or selected points
      this.cleanUp();
      return;
    }

    const isAltMode = event.ctrlKey || event.shiftKey;

    if (isAltMode) {
      return;
    }
    const overHandles = this.mouseOverService.pathDataSubject.getHandles();
    if (!overHandles || overHandles.length === 0) {
      // Start click or rect transform, deselect all selected
      this.selectionService.pathDataSubject.setNone();
    } else {
      // Get transform handles to be moved
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
        const transforms = super
          .startTransformations(nodesToSelect, event.getDOMPoint(), null)
          .filter((p) => p instanceof PathTransform) as PathTransform[];
        transforms.forEach((p) => {
          p.pathHandles = handles.filter((handle) => handle.node === p.node);
        });
        this.transformations = transforms;
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

    return null;
  }
  /**
   * Override
   */
  cleanUp() {
    this.mouseOverRenderer.resume();
    // this.lastDeg = null;
    // this.startedNode = null;
    super.cleanUp();
    // this.cursor.setCursor(CursorType.Default);
  }

  /**
   * Override
   */
  onWindowMouseMove(event: MouseEventArgs) {
    if (this.selectionRect && !this.click) {
      this.mouseOverRenderer.suspend(true);
    }

    super.onWindowMouseMove(event);
    // Transformation transaction is started.
    if (this.transformations) {
      return;
    }

    const screenPos = event.getDOMPoint();
    const nodes = this.selectionService.getSelected();
    const overPoints =
      this.intersectionService.intersectPathDataHandles(
        nodes,
        this.selectionRect,
        screenPos
      ) || [];

    // No handles selected, select curve if not a rectangular selection:
    if (overPoints.length === 0 && !this.selectionRect) {
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
  selectionUpdate(event: MouseEventArgs) {
    if (!this.selectionRect) {
      return;
    }

    // const selected = this.getIntersects() as TreeNode[];
    // this.outlineService.setSelected(selected);
  }

  /**
   * Override
   */
  selectionEnded(event: MouseEventArgs) {
    if (this.transformations) {
      return;
    }
    const screenPos = event.getDOMPoint();
    const nodes = this.selectionService.getSelected();
    const overPoints = this.intersectionService.intersectPathDataHandles(
      nodes,
      this.click ? null : this.selectionRect,
      screenPos
    );

    let changeStateMode = ChangeStateMode.Normal;
    if (this.click) {
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
    this.selectionRect = null;
  }
}
