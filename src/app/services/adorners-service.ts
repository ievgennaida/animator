import { Injectable } from "@angular/core";
import { TreeNode } from "../models/tree-node";
import { ConfigService } from "./config-service";
import { SelectionService } from "./selection.service";
import { Utils } from "./utils/utils";
import { Adorner, AdornerMode } from "./viewport/adorners/adorner";
/**
 *
 */
@Injectable({
  providedIn: "root",
})
export class AdornersService {
  constructor(
    private selectionService: SelectionService,
    private configService: ConfigService
  ) {}
  /**
   * Adorner that represents multiple items selected.
   */
  selectionAdorner: Adorner | null = null;
  adornerHandlesActive = true;
  cache = new Map<TreeNode, Adorner>();
  /**
   * Calculate multiple selected items bounds adorner
   */
  buildSelectionAdorner(nodes: TreeNode[]): Adorner {
    if (!nodes || nodes.length <= 1) {
      this.selectionAdorner = null;
    } else {
      let globalBBox: DOMRect = null;
      nodes.forEach((node) => {
        if (!node) {
          return;
        }
        let nodeBBox = node.getBBox();
        if (!nodeBBox) {
          return;
        }
        nodeBBox = Utils.matrixRectTransform(
          nodeBBox,
          node.getScreenCTM(),
          true
        );
        if (!globalBBox) {
          globalBBox = nodeBBox;
        } else {
          globalBBox = Utils.mergeRects(globalBBox, nodeBBox);
        }
      });
      if (globalBBox) {
        const toSet = Adorner.fromDOMRect(globalBBox);
        toSet.mode = AdornerMode.Selection;
        this.selectionAdorner = toSet;
      } else {
        this.selectionAdorner = null;
      }
    }

    return this.selectionAdorner;
  }
  getActiveAdorners(): Adorner[] {
    const adorners = this.selectionService
      .getSelected()
      .map((p) => this.getAdorner(p));
    if (this.selectionAdorner) {
      adorners.push(this.selectionAdorner);
    }
    if (this.selectionService.pathDataSubject.bounds) {
      // adorners.push(this.pathDataSubject.bounds);
    }

    return adorners;
  }

  cleanCache() {
    this.cache.clear();
  }
  /**
   * Get adorner manipulation points points in screen coordinates.
   */
  getAdorner(node: TreeNode): Adorner {
    const cached = this.cache.get(node);
    if (cached) {
      return cached;
    }

    let adorner = new Adorner();
    adorner.node = node;
    adorner.mode = AdornerMode.TransformedElement;
    const bounds = node.getBBox();
    adorner.setRect(bounds);
    adorner.setCenterTransform(
      Utils.getCenterTransform(node.getElement(), bounds)
    );

    adorner = adorner.matrixTransform(node.getScreenCTM());
    if (!this.configService.get().showTransformedBBoxes) {
      adorner.untransformSelf();
      adorner.mode = AdornerMode.ElementsBounds;
    }

    this.cache.set(node, adorner);
    return adorner;
  }
  isAdornerHandlesActive(adorner: Adorner): boolean {
    if (!this.adornerHandlesActive || !adorner) {
      return false;
    }
    const active = this.getActiveAdorners();
    if (!active || active.length <= 0) {
      return false;
    }
    if (active.length === 1) {
      return true;
    } else if (adorner.mode === AdornerMode.Selection) {
      return true;
    }

    return false;
  }
}
