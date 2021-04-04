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
import { TransformationModeIcon } from "../../../../models/transformation-mode";
import { MatrixScaleAction } from "./matrix-scale-action";
import { LoggerService } from "src/app/services/logger.service";

@Injectable({
  providedIn: "root",
})
export class RectScaleAction extends MatrixScaleAction {
  title = "Scale";
  icon = TransformationModeIcon.scale;

  propX = "x";
  propY = "y";
  sizePropertyX = "width";
  sizePropertyY = "height";

  startRect: DOMRect | null = null;
  centerTransform: DOMPoint | null = null;
  constructor(
    propertiesService: PropertiesService,
    viewService: ViewService,
    private logger: LoggerService
  ) {
    super(propertiesService, viewService);
  }
  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData) {
    this.node = node;
    this.handle = handle;
    if (this.propertiesService.isCenterTransformSet(node)) {
      this.centerTransform = Utils.toElementPoint(
        node,
        handle?.adorner?.screen?.centerTransform || null
      );
    }

    const x = this.propertiesService.getNum(this.node, this.propX);
    const y = this.propertiesService.getNum(this.node, this.propY);
    const w = this.propertiesService.getNum(this.node, this.sizePropertyX);
    const h = this.propertiesService.getNum(this.node, this.sizePropertyY);
    this.startRect = new DOMRect(x || 0, y || 0, w || 0, h || 0);

    super.init(node, screenPos, handle);
  }

  getElement(): SVGGraphicsElement | null {
    return this.node?.getElement() || null;
  }

  /**
   * Apply matrix in screen coordinates,
   */
  applyMatrix(matrix: DOMMatrix, applyCurrent = false): boolean {
    if (!this.node) {
      this.logger.log(
        "Element cannot be transformed. Should be initialized first"
      );
      return false;
    }
    if (!this.transformElementCoordinates) {
      return super.applyMatrix(matrix, applyCurrent);
    }
    const out = MatrixUtils.matrixRectTransform(this.startRect, matrix);
    if (!out) {
      return false;
    }
    if (this.initialValues.size === 0) {
      this.saveInitialValues(
        [this.node],
        [
          this.propX,
          this.propY,
          this.sizePropertyX,
          this.sizePropertyY,
          TransformPropertyKey,
          CenterTransformX,
          CenterTransformY,
        ]
      );
    }
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
