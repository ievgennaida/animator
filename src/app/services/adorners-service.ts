import { Injectable } from "@angular/core";
import { consts } from "src/environments/consts";
import { TreeNode } from "../models/tree-node";
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
  constructor(private selectionService: SelectionService) {}
  /**
   * Adorner that represents multiple items selected.
   */
  selectionAdorner: Adorner | null = null;
  adornerHandlesActive = true;
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
      .map((p) => p.getAdorners());
    if (this.selectionAdorner) {
      adorners.push(this.selectionAdorner);
    }
    if (this.selectionService.pathDataSubject.bounds) {
      // adorners.push(this.pathDataSubject.bounds);
    }

    return adorners;
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
