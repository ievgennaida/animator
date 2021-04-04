import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { AdornerContainer } from "../models/adorner";
import { AdornerPointType } from "../models/adorner-point-type";
import { AdornerType } from "../models/adorner-type";
import { PathDataHandleType } from "../models/path-data-handle-type";
import { PathType } from "../models/path/path-type";
import { TreeNode } from "../models/tree-node";
import { ConfigService } from "./config-service";
import { PropertiesService } from "./properties.service";
import { SelectionService } from "./selection.service";
import { MatrixUtils } from "./utils/matrix-utils";
import { Utils } from "./utils/utils";
/**
 *
 */
@Injectable({
  providedIn: "root",
})
export class AdornersService {
  /**
   * Adorner that represents multiple items selected.
   */
  selectionAdorner: AdornerContainer = new AdornerContainer();

  /**
   * Adorner that represents multiple path data items selected.
   */
  pathDataSelectionAdorner: AdornerContainer = new AdornerContainer();
  pathDataSelectorActive = true;
  showBBoxHandlesSubject = new BehaviorSubject<boolean>(true);

  get showBBoxHandles(): boolean {
    return this.showBBoxHandlesSubject.getValue();
  }
  set showBBoxHandles(val: boolean) {
    if (this.showBBoxHandles !== val) {
      this.showBBoxHandlesSubject.next(val);
    }
  }
  cache = new Map<TreeNode, AdornerContainer>();
  constructor(
    private selectionService: SelectionService,
    private configService: ConfigService,
    private propertiesService: PropertiesService
  ) {
    this.selectionAdorner.type = AdornerType.selection;
    this.pathDataSelectionAdorner.type = AdornerType.pathDataSelection;
  }
  /**
   * Calculate multiple selected items bounds adorner
   */
  buildSelectionAdorner(
    rootNode: TreeNode | null,
    nodes: TreeNode[],
    resetCenterTransform = false
  ): AdornerContainer {
    this.selectionAdorner.node = rootNode;
    let anchoredBBOx: DOMRect | null = null;
    if (nodes && nodes.length > 1) {
      nodes.forEach((node) => {
        if (!node) {
          return;
        }
        let nodeBBox = node.getBBox();
        if (nodeBBox) {
          // Anchor coordinates to the view port root svg node:
          const matrix = MatrixUtils.transformToElement(node, rootNode);
          // Get rect bbounds in transformed viewport coordinates:
          nodeBBox = MatrixUtils.matrixRectTransform(nodeBBox, matrix, true);

          if (!anchoredBBOx) {
            anchoredBBOx = nodeBBox;
          } else {
            anchoredBBOx = Utils.mergeRects(anchoredBBOx, nodeBBox);
          }
        }
      });
    }

    this.setBBoxToAdorner(
      this.selectionAdorner,
      anchoredBBOx,
      resetCenterTransform
    );
    this.selectionAdorner.showBounds = !this.pathDataSelectionAdorner.enabled;
    return this.selectionAdorner;
  }

  /**
   * Calculate multiple selected path data adorners
   */
  buildPathDataSelectionAdorner(
    rootNode: TreeNode,
    resetCenterTransform = false
  ): void {
    this.pathDataSelectionAdorner.node = rootNode;
    const points = (
      this.selectionService.pathDataSubject.getValues() || []
    ).filter((p) => p.type === PathDataHandleType.point);
    let bbox: DOMRect | null = null;
    if (points && points.length > 1) {
      const screenPoints = points
        .map((handle) => {
          const node = handle?.node;
          if (!node) {
            return null;
          }
          const command = node.getPathData()?.commands[handle.commandIndex];
          if (!command || !command.p || command.isType(PathType.closeAbs)) {
            return null;
          }
          const p = Utils.toScreenPoint(node, command.p);
          return p || null;
        })
        .filter((p) => !!p);
      // In screen coords
      bbox = Utils.getPointsBounds(...screenPoints);
    }

    if (bbox) {
      // Anchor coordinates to the view port root svg node.
      // so any viewport transform can be applied. ex: zoom, pan and point will remain the same.
      bbox = MatrixUtils.matrixRectTransform(
        bbox,
        rootNode?.getScreenCTM()?.inverse() || null,
        false
      );
    }

    this.setBBoxToAdorner(
      this.pathDataSelectionAdorner,
      bbox,
      resetCenterTransform
    );
    this.selectionAdorner.showBounds = !this.pathDataSelectionAdorner.enabled;
  }

  getActiveAdorners(): AdornerContainer[] {
    const adorners = this.selectionService
      .getSelected()
      .map((p) => this.getAdorner(p));

    if (
      this.pathDataSelectionAdorner &&
      this.pathDataSelectionAdorner.enabled &&
      this.pathDataSelectorActive
    ) {
      adorners.push(this.pathDataSelectionAdorner);
      // Active main selection only when path data is not active:
    } else if (this.selectionAdorner && this.selectionAdorner.enabled) {
      adorners.push(this.selectionAdorner);
    }

    return adorners;
  }

  cleanCache(onlyScreenCache = false): void {
    // Reset only screen coordinates cache.(ex: viewport scaled, no need to recalc elements)
    if (onlyScreenCache) {
      this.cache.forEach((p) => p.resetCache());
    } else {
      this.cache.clear();
    }
  }
  /**
   * Get adorner manipulation points points in screen coordinates.
   */
  getAdorner(node: TreeNode): AdornerContainer {
    const cached = this.cache.get(node);
    if (cached) {
      return cached;
    }

    const adorner = new AdornerContainer();
    adorner.node = node;
    adorner.type = AdornerType.transformedElement;
    const elementAdorner = adorner.setBBox(node.getBBox());
    const config = this.configService.get();
    if (!config.showTransformedBBoxes) {
      adorner.type = AdornerType.elementsBounds;
      let matrix = node.getScreenCTM();
      if (matrix) {
        elementAdorner.matrixTransformSelf(matrix);
        elementAdorner.untransformSelf();
      }
      // Read one more time after transform:
      matrix = node?.getScreenCTM()?.inverse() || null;
      if (matrix) {
        elementAdorner.matrixTransformSelf(matrix);
      }
    }
    adorner.calculateTranslatePosition(
      config.translateHandleOffsetX,
      config.translateHandleOffsetY
    );
    adorner.setCenterTransform(
      this.propertiesService.getCenterTransform(node, false)
    );

    this.cache.set(node, adorner);
    return adorner;
  }
  /**
   * Common check point whether adorner is active for mouse over and renderers.
   */
  isAdornerActive(
    adorner: AdornerContainer,
    activeAdorners: AdornerContainer[],
    adornerPointType: AdornerPointType
  ): boolean {
    if (
      !adorner ||
      !activeAdorners ||
      !adorner.showHandles ||
      !this.showBBoxHandles
    ) {
      return false;
    }

    if (adornerPointType === AdornerPointType.center) {
      return false;
    }
    const config = this.configService.get();

    const multipleSelected = activeAdorners.find(
      (p) => p.type === AdornerType.selection
    );
    if (multipleSelected && multipleSelected.enabled) {
      // Not a main selection:
      if (adorner.type !== AdornerType.selection) {
        // Don't show translate adorners when multiple are selected:
        return false;
      }
    }
    // When translate handle is disabled:
    if (
      adornerPointType === AdornerPointType.translate &&
      !config.translateHandleEnabled
    ) {
      return false;
    }
    if (!adorner.showHandles) {
      return false;
    }
    if (!activeAdorners || activeAdorners.length <= 0) {
      return false;
    }

    if (activeAdorners.length === 1) {
      if (activeAdorners[0].node && !activeAdorners[0].node.allowResize) {
        return false;
      }

      return true;
    } else if (adorner.type === AdornerType.selection) {
      return true;
    } else if (adorner.type === AdornerType.pathDataSelection) {
      return true;
    }

    return false;
  }
  private setBBoxToAdorner(
    container: AdornerContainer | null,
    rectElementCoords: DOMRect | null,
    resetCenterTransform = false
  ): void {
    if (!container) {
      return;
    }
    if (
      rectElementCoords &&
      rectElementCoords.height > 0 &&
      rectElementCoords.width > 0
    ) {
      const center = container.element.centerTransform;
      const config = this.configService.get();
      container.setBBox(rectElementCoords);
      if (center && !resetCenterTransform) {
        container.setCenterTransform(center);
      }
      container.calculateTranslatePosition(
        config.translateHandleOffsetX,
        config.translateHandleOffsetY
      );

      container.enabled = true;
    } else {
      container.setCenterTransform(null);
      container.enabled = false;
    }
  }
}
