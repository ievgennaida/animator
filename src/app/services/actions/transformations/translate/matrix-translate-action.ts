import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { PropertiesService } from "src/app/services/properties.service";
import { Utils } from "../../../utils/utils";
import { BaseTransformAction } from "../base-transform-action";
import { MatrixUtils } from "../matrix-utils";
@Injectable({
  providedIn: "root",
})
export class MatrixTranslateAction extends BaseTransformAction {
  constructor(propertiesService: PropertiesService) {
    super(propertiesService);
  }
  /**
   * Start click position in anchor coordinates.
   */
  start: DOMPoint = null;
  node: TreeNode = null;

  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData) {
    this.attributesToStore = [MatrixUtils.TransformPropertyKey];
    this.node = node;
    const element = node.getElement();
    const startPoint = Utils.toElementPoint(element, screenPos);
    this.start = startPoint;
  }

  transformByMouse(screenPos: DOMPoint) {
    const element = this.node.getElement();
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
    const element = this.node.getElement();
    this.saveInitialValue();
    const transformList = element.transform;
    if (transformList.baseVal.numberOfItems === 0) {
      const svgTransform = element.ownerSVGElement.createSVGTransform();
      svgTransform.setTranslate(x, y);
      transformList.baseVal.appendItem(svgTransform);
      return true;
    } else if (transformList.baseVal.numberOfItems === 1) {
      const svgTransform = transformList.baseVal[0];
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
    transform.setMatrix(matrix);

    element.transform.baseVal.initialize(transform);

    return true;
  }
}