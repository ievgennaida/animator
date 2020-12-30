import { Injectable, Type } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { UndoService } from "../../undo.service";
import { BaseAction } from "../base-action";
import {
  rotateActions,
  scaleActions,
  skewActions,
  translateActions,
} from "./actions-mapping";
import { BaseTransformAction } from "./base-transform-action";
import { MatrixRotateAction } from "./rotate/matrix-rotate-action";
import { MatrixScaleAction } from "./scale/matrix-scale-action";
import { MatrixSkewAction } from "./skew/matrix-skew-action";
import { TransformationMode } from "./transformation-mode";
import { MatrixTranslateAction } from "./translate/matrix-translate-action";

/**
 * Transform multiple nodes and store state for the undo service.
 * Each element can be transformed in a different way: x,y, cx,cy and etc,
 * so for each node different sub actions are spawned.
 */
@Injectable({
  providedIn: "root",
})
export class TransformAction extends BaseAction {
  constructor(private undoService: UndoService) {
    super();
  }
  mode: TransformationMode = TransformationMode.None;
  transformations: Array<BaseTransformAction> = [];
  changed = false;
  committed = false;
  /**
   * Get transform action for the node by type.
   */
  getTransform(node: TreeNode, mode: TransformationMode): BaseTransformAction {
    if (!node) {
      return null;
    }
    let actionType: Type<BaseTransformAction> | null = null;
    if (mode === TransformationMode.Translate) {
      actionType = translateActions.get(node.type) || MatrixTranslateAction;
    } else if (mode === TransformationMode.Rotate) {
      actionType = rotateActions.get(node.type) || MatrixRotateAction;
    } else if (mode === TransformationMode.Scale) {
      actionType = scaleActions.get(node.type) || MatrixScaleAction;
    } else if (mode === TransformationMode.Skew) {
      actionType = skewActions.get(node.type) || MatrixSkewAction;
    }
    if (!actionType) {
      return null;
    }
    const actionInstance = this.undoService.getAction<BaseTransformAction>(
      actionType
    );
    return actionInstance;
  }

  /**
   * Is transformation transaction running
   */
  isActive() {
    return this.transformations !== null && this.transformations.length > 0;
  }
  isChanged() {
    return this.changed;
  }
  commit(): boolean {
    this.committed = true;
    this.changed = false;
    if (this.transformations) {
      this.transformations.forEach((p) => p.commit());
    }
    this.undoService.update();
    return true;
  }
  execute() {
    if (!this.transformations) {
      return;
    }
    this.transformations.forEach((p) => this.undoService._executeAction(p));
  }
  undo() {
    if (!this.transformations) {
      return;
    }

    // Undo to the initial state:
    this.transformations.forEach((p) => this.undoService._undoAction(p));
  }

  transformByMouse(screenPos: DOMPoint): boolean {
    if (!this.transformations) {
      return false;
    }
    let changed = false;
    this.transformations.forEach((p) => {
      changed = p.transformByMouse(screenPos) || changed;
    });

    if (changed) {
      this.changed = this.changed || changed;
      // this.emitTransformed(null);
    }
    return changed;
  }
  init(
    mode: TransformationMode,
    nodes: TreeNode[],
    screenPos: DOMPoint | null,
    handle: HandleData | null
  ): void {
    this.mode = mode;
    if (!nodes || nodes.length === 0) {
      return;
    }
    this.transformations = nodes
      .map((node) => {
        const transform = this.getTransform(node, mode);
        if (transform) {
          transform.init(node, screenPos, handle);
        }
        return transform;
      })
      .filter((p) => !!p);

    // this.activeAction.icon = this.activeAction.transactions[0].icon;
    this.changed = false;
  }
}
