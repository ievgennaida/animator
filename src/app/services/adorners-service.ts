import { Injectable } from "@angular/core";
import { TreeNode } from "../models/tree-node";
import { ConfigService } from "./config-service";
import { PropertiesService } from "./properties.service";
import { SelectionService } from "./selection.service";
import { MatrixUtils } from "./utils/matrix-utils";
import { Utils } from "./utils/utils";
import { AdornerContainer } from "./viewport/adorners/adorner";
import {
  AdornerPointType,
  AdornerType,
} from "./viewport/adorners/adorner-type";
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
  ) {}

  /**
   * Adorner that represents multiple items selected.
   */
  selectionAdorner: AdornerContainer = new AdornerContainer();
  adornerHandlesActive = true;
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
    this.selectionAdorner.isScreen = false;
    let globalBBox: DOMRect = null;
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

        if (!globalBBox) {
          globalBBox = nodeBBox;
        } else {
          globalBBox = Utils.mergeRects(globalBBox, nodeBBox);
        }
      });
    }
    if (globalBBox && globalBBox.height > 0 && globalBBox.width > 0) {
      const center = this.selectionAdorner.element.centerTransform;
      const config = this.configService.get();
      this.selectionAdorner.setBBox(globalBBox);
      if (center && !resetCenterTransform) {
        this.selectionAdorner.setCenterTransform(center);
      }
      this.selectionAdorner.calculateTranslatePosition(
        config.translateHandleOffsetX,
        config.translateHandleOffsetY
      );
      this.selectionAdorner.type = AdornerType.Selection;
      this.selectionAdorner.enabled = true;
    } else {
      this.selectionAdorner.setCenterTransform(null);
      this.selectionAdorner.enabled = false;
    }

    return this.selectionAdorner;
  }
  getActiveAdorners(): AdornerContainer[] {
    const adorners = this.selectionService
      .getSelected()
      .map((p) => this.getAdorner(p));
    if (this.selectionAdorner && this.selectionAdorner.enabled) {
      adorners.push(this.selectionAdorner);
    }
    if (this.selectionService.pathDataSubject.bounds) {
      // adorners.push(this.pathDataSubject.bounds);
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
    if (adornerPointType === AdornerPointType.Center) {
      return false;
    }
    const config = this.configService.get();

    const multiple = !!activeAdorners.find(
      (p) => p.type === AdornerType.Selection
    );
    if (
      adornerPointType === AdornerPointType.Translate &&
      !config.translateHandleEnabled
    ) {
      return false;
    }
    if (
      multiple &&
      adorner.type !== AdornerType.Selection &&
      adornerPointType === AdornerPointType.Translate &&
      config.translateHandleEnabled
    ) {
      return false;
    }
    if (
      multiple &&
      adorner.type !== AdornerType.Selection &&
      adornerPointType === AdornerPointType.CenterTransform
    ) {
      return false;
    }

    if (!this.adornerHandlesActive || !adorner || !activeAdorners) {
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
    }

    return false;
  }
}
