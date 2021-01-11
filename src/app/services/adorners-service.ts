import { Injectable } from "@angular/core";
import { AdornerContainer } from "../models/adorner";
import { AdornerPointType, AdornerType } from "../models/adorner-type";
import { PathDataHandleType } from "../models/path-data-handle";
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
  constructor(
    private selectionService: SelectionService,
    private configService: ConfigService,
    private propertiesService: PropertiesService
  ) {
    this.selectionAdorner.type = AdornerType.Selection;
    this.pathDataSelectionAdorner.type = AdornerType.PathDataSelection;
  }

  /**
   * Adorner that represents multiple items selected.
   */
  selectionAdorner: AdornerContainer = new AdornerContainer();

  /**
   * Adorner that represents multiple path data items selected.
   */
  pathDataSelectionAdorner: AdornerContainer = new AdornerContainer();
  pathDataSelectorActive = true;
  cache = new Map<TreeNode, AdornerContainer>();
  /**
   * Calculate multiple selected items bounds adorner
   */
  buildSelectionAdorner(
    rootNode: TreeNode,
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
        if (!nodeBBox) {
          return;
        }

        // Anchor coordinates to the view port root svg node:
        const matrix = MatrixUtils.transformToElement(node, rootNode);
        // Get rect bbounds in transformed viewport coordinates:
        nodeBBox = MatrixUtils.matrixRectTransform(nodeBBox, matrix, true);

        if (!anchoredBBOx) {
          anchoredBBOx = nodeBBox;
        } else {
          anchoredBBOx = Utils.mergeRects(anchoredBBOx, nodeBBox);
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
  ) {
    this.pathDataSelectionAdorner.node = rootNode;
    const points = (
      this.selectionService.pathDataSubject.getValues() || []
    ).filter((p) => p.commandType === PathDataHandleType.Point);
    let bbox: DOMRect | null = null;
    if (points && points.length > 1) {
      const screenPoints = points.map((handle) => {
        const node = handle?.node;
        if (!node) {
          return;
        }
        let p = node.getPathData()?.commands[handle.commandIndex]?.p;
        if (!p) {
          return;
        }

        p = Utils.toScreenPoint(node, p);
        return p;
      });
      // In screen coords
      bbox = Utils.getPointsBounds(...screenPoints);
    }

    if (bbox) {
      // Anchor coordinates to the view port root svg node.
      // so any viewport transform can be applied. ex: zoom, pan and point will remain the same.
      bbox = MatrixUtils.matrixRectTransform(
        bbox,
        rootNode.getScreenCTM().inverse(),
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

  private setBBoxToAdorner(
    container: AdornerContainer,
    rectElementCoords: DOMRect,
    resetCenterTransform = false
  ) {
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

  cleanCache(onlyScreenCache = false) {
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
    adorner.type = AdornerType.TransformedElement;
    const elementAdorner = adorner.setBBox(node.getBBox());
    const config = this.configService.get();
    if (!config.showTransformedBBoxes) {
      adorner.type = AdornerType.ElementsBounds;
      elementAdorner.matrixTransformSelf(node.getScreenCTM());
      elementAdorner.untransformSelf();
      elementAdorner.matrixTransformSelf(node.getScreenCTM().inverse());
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
    if (!adorner || !activeAdorners || !adorner.showHandles) {
      return false;
    }

    if (adornerPointType === AdornerPointType.Center) {
      return false;
    }
    const config = this.configService.get();

    const multipleSelected = activeAdorners.find(
      (p) => p.type === AdornerType.Selection
    );
    if (multipleSelected && multipleSelected.enabled) {
      // Not a main selection:
      if (adorner.type !== AdornerType.Selection) {
        // Don't show translate adorners when multiple are selected:
        return false;
      }
    }
    // When translate handle is disabled:
    if (
      adornerPointType === AdornerPointType.Translate &&
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
    } else if (adorner.type === AdornerType.Selection) {
      return true;
    } else if (adorner.type === AdornerType.PathDataSelection) {
      return true;
    }

    return false;
  }
}
