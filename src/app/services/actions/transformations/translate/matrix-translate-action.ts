import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import {
  PropertiesService,
  TransformPropertyKey,
} from "src/app/services/properties.service";
import { MatrixUtils } from "../../../utils/matrix-utils";
import { Utils } from "../../../utils/utils";
import { BaseTransformAction } from "../base-transform-action";
import { TransformationModeIcon } from "../../../../models/transformation-mode";
@Injectable({
  providedIn: "root",
})
export class MatrixTranslateAction extends BaseTransformAction {
  title = "Move";
  icon = TransformationModeIcon.move;
  /**
   * Start click position in anchor coordinates.
   */
  start: DOMPoint | null = null;
  node: TreeNode | null = null;
  constructor(propertiesService: PropertiesService) {
    super(propertiesService);
  }
  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData): void {
    this.node = node;
    const element = node?.getElement();
    if (!element) {
      return;
    }
    const startPoint = Utils.toElementPoint(element, screenPos);
    this.start = startPoint;
  }

  transformByMouse(screenPos: DOMPoint): boolean {
    const element = this.node?.getElement();
    if (!element) {
      return false;
    }
    const offset = Utils.toElementPoint(element, screenPos);
    if (!offset) {
      return false;
    }
    if (this.start) {
      offset.x -= this.start.x;
      offset.y -= this.start.y;
    }
    return this.offsetTranslate(offset.x, offset.y);
  }

  /**
   * Matrix translate
   */
  offsetTranslate(x: number, y: number): boolean {
    const element = this.node?.getElement();
    if (!element || !this.node || !element.ownerSVGElement) {
      return false;
    }
    if (this.initialValues.size === 0) {
      this.saveInitialValues([this.node], [TransformPropertyKey]);
    }
    const transformList = element.transform;
    if (transformList.baseVal.numberOfItems === 0) {
      const svgTransform = element.ownerSVGElement.createSVGTransform();
      svgTransform.setTranslate(x, y);
      transformList.baseVal.appendItem(svgTransform);
      return true;
    } else if (transformList.baseVal.numberOfItems === 1) {
      const svgTransform = transformList.baseVal.getItem(0);
      if (svgTransform.type === svgTransform.SVG_TRANSFORM_TRANSLATE) {
        const decompose = MatrixUtils.decomposeTransformList(
          transformList.baseVal
        );
        if (decompose && decompose.translateX && decompose.translateY) {
          svgTransform.setTranslate(
            decompose.translateX + x,
            decompose.translateY + y
          );
        } else {
          svgTransform.setTranslate(x, y);
        }

        return true;
      }
    }

    const transform = Utils.getElementTransform(element);

    const matrix = transform.matrix.translate(x, y);
    this.propertiesService.setMatrixTransform(this.node, matrix);

    return true;
  }
}
