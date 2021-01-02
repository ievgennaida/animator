import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import {
  CenterTransformX,
  CenterTransformY,
  PropertiesService,
  TransformPropertyKey,
} from "src/app/services/properties.service";
import { Utils } from "src/app/services/utils/utils";
import { ViewService } from "src/app/services/view.service";
import { MatrixUtils } from "../../../utils/matrix-utils";
import { TransformationModeIcon } from "../transformation-mode";
import { MatrixScaleAction } from "./matrix-scale-action";

@Injectable({
  providedIn: "root",
})
export class RectScaleAction extends MatrixScaleAction {
  constructor(propertiesService: PropertiesService, viewService: ViewService) {
    super(propertiesService, viewService);
  }
  title = "Scale";
  icon = TransformationModeIcon.Scale;

  propX = "x";
  propY = "y";
  sizePropertyX = "width";
  sizePropertyY = "height";

  startRect: DOMRect = null;
  centerTransform: DOMPoint | null = null;
  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData) {
    this.node = node;
    this.handle = handle;
    this.attributesToStore = [
      this.propX,
      this.propY,
      this.sizePropertyX,
      this.sizePropertyY,
      TransformPropertyKey,
    ];

    if (this.propertiesService.isCenterTransformSet(node)) {
      this.attributesToStore.push(CenterTransformX);
      this.attributesToStore.push(CenterTransformY);
      this.centerTransform = Utils.toElementPoint(
        node,
        handle?.adorner?.screen?.centerTransform
      );
    }

    this.startRect = new DOMRect(
      this.propertiesService.getNum(this.node, this.propX),
      this.propertiesService.getNum(this.node, this.propY),
      this.propertiesService.getNum(this.node, this.sizePropertyX),
      this.propertiesService.getNum(this.node, this.sizePropertyY)
    );

    super.init(node, screenPos, handle);
  }

  getElement(): SVGGraphicsElement | null {
    return this.node?.getElement() || null;
  }

  /**
   * Apply matrix in screen coordinates,
   */
  applyMatrix(matrix: DOMMatrix, applyCurrent = false): boolean {
    if (!this.transformElementCoordinates) {
      return super.applyMatrix(matrix, applyCurrent);
    }
    const out = MatrixUtils.matrixRectTransform(this.startRect, matrix);
    if (!out) {
      return false;
    }

    this.saveInitialValue();
    this.onReverseScale(out);

    this.propertiesService.setNum(this.node, this.propX, out.x);
    this.propertiesService.setNum(this.node, this.propY, out.y);
    this.propertiesService.setNum(this.node, this.sizePropertyX, out.width);
    this.propertiesService.setNum(this.node, this.sizePropertyY, out.height);

    this.node.cleanCache();
    if (this.centerTransform) {
      this.propertiesService.transformCenterByMatrix(
        this.node,
        matrix,
        this.centerTransform
      );
    }

    return true;
  }

  protected onReverseScale(rect: DOMRect): DOMRect {
    // Reverse scaling
    if (rect.width < 0 || rect.height < 0) {
      if (rect.width < 0) {
        rect.x += rect.width;
        rect.width = -rect.width;
      }

      if (rect.height < 0) {
        rect.y += rect.height;
        rect.height = -rect.height;
      }
    }

    return rect;
  }
}
