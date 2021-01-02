import { Injectable, Type } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { UndoService } from "../../undo.service";
import { Utils } from "../../utils/utils";
import {
  AdornerPointType,
  AdornerType,
} from "../../viewport/adorners/adorner-type";
import { BaseAction } from "../base-action";
import {
  rotateActions,
  scaleActions,
  scaleElementActions,
  skewActions,
  translateActions,
} from "./actions-mapping";
import { BaseTransformAction } from "./base-transform-action";
import { MatrixRotateAction } from "./rotate/matrix-rotate-action";
import { CenterSelectionScaleAction } from "./scale/center-selection-scale-action";
import { MatrixElementScaleAction } from "./scale/matrix-element-scale-action";
import { MatrixScaleAction } from "./scale/matrix-scale-action";
import { MatrixSkewAction } from "./skew/matrix-skew-action";
import { TransformationMode } from "./transformation-mode";
import { CenterElementTranslateAction } from "./translate/center-element-translate-action";
import { CenterSelectionTranslateAction } from "./translate/center-selection-translate-action";
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
  handle: HandleData | null = null;
  changed = false;
  committed = false;
  /**
   * Get transform action for the node by type.
   */
  getTransform(
    node: TreeNode,
    mode: TransformationMode,
    adornerMode: AdornerType = AdornerType.TransformedElement,
    adornerType: AdornerPointType = AdornerPointType.None
  ): BaseTransformAction {
    let actionType: Type<BaseTransformAction> | null = null;
    if (mode === TransformationMode.Translate) {
      if (adornerType === AdornerPointType.CenterTransform) {
        if (adornerMode === AdornerType.Selection) {
          actionType = CenterSelectionTranslateAction;
        } else {
          actionType = CenterElementTranslateAction;
        }
      }
    } else if (mode === TransformationMode.Scale) {
      if (adornerType === AdornerPointType.CenterTransform) {
        if (adornerMode === AdornerType.Selection) {
          actionType = CenterSelectionScaleAction;
        } else {
          return null;
        }
      }
    }

    if (node && !actionType) {
      if (mode === TransformationMode.Translate) {
        if (!node.allowTranslate) {
          return null;
        }
        actionType = translateActions.get(node.type) || MatrixTranslateAction;
      } else if (mode === TransformationMode.Rotate) {
        if (!node.allowRotate) {
          return null;
        }
        actionType = rotateActions.get(node.type) || MatrixRotateAction;
      } else if (mode === TransformationMode.Scale) {
        if (!node.allowResize) {
          return null;
        }
        if (adornerMode === AdornerType.TransformedElement) {
          actionType =
            scaleElementActions.get(node.type) || MatrixElementScaleAction;
        } else {
          actionType = scaleActions.get(node.type) || MatrixScaleAction;
        }
      } else if (mode === TransformationMode.Skew) {
        actionType = skewActions.get(node.type) || MatrixSkewAction;
      }
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

    const multipleSelected = handle?.adorner?.type === AdornerType.Selection;
    const centerTransformApplied =
      multipleSelected && handle?.handle === AdornerPointType.CenterTransform;
    if (centerTransformApplied) {
      // No need to repeat the same action, limit the array by one.
      nodes.length = 1;
    }

    this.transformations = nodes
      .map((node) => {
        const transform = this.getTransform(
          node,
          mode,
          handle?.adorner?.type,
          handle?.handle
        );
        if (transform) {
          transform.init(node, screenPos, handle);
        }

        return transform;
      })
      .filter((p) => !!p);

    // Set child info for the history view when one is applied:
    if (this.transformations.length === 1) {
      const action = this.transformations[0];
      if (action.icon) {
        this.icon = action.icon;
        this.iconSVG = action.iconSVG;
      }
      this.title = `${action.title} ${Utils.getTreeNodesTitle(nodes)}`;
      this.tooltip = action.tooltip;
    }

    // When multiple items are transformed we need also to transform central point if was changed:
    if (
      multipleSelected &&
      handle?.handle !== AdornerPointType.CenterTransform &&
      handle?.adorner?.screen?.centerTransform
    ) {
      const actionInstance = this.getTransform(
        null,
        mode,
        handle.adorner?.type,
        AdornerPointType.CenterTransform
      );
      if (actionInstance) {
        actionInstance.init(handle.adorner?.node, screenPos, handle);
        this.transformations.push(actionInstance);
      }
    }
    // this.activeAction.icon = this.activeAction.transactions[0].icon;
    this.changed = false;
  }
}
