import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { PathDataHandle } from "src/app/models/path-data-handle";
import { PathData } from "src/app/models/path/path-data";
import { TreeNode } from "src/app/models/tree-node";
import {
  CenterTransformX,
  CenterTransformY,
  PathDataPropertyKey,
  PropertiesService,
  TransformPropertyKey,
} from "src/app/services/properties.service";
import { Utils } from "src/app/services/utils/utils";
import { ViewService } from "src/app/services/view.service";
import { AdornerType } from "src/app/services/viewport/adorners/adorner-type";
import { MatrixUtils, PathDataUtils } from "../../../utils/matrix-utils";
import { TransformationModeIcon } from "../transformation-mode";
import { MatrixScaleAction } from "./matrix-scale-action";

@Injectable({
  providedIn: "root",
})
export class PathScaleAction extends MatrixScaleAction {
  constructor(propertiesService: PropertiesService, viewService: ViewService) {
    super(propertiesService, viewService);
  }
  title = "Scale";
  icon = TransformationModeIcon.Scale;
  started: DOMPoint | null = null;
  centerTransform: DOMPoint | null = null;
  /**
   * List of a particular path handles to be transformed.
   */
  public pathHandles: PathDataHandle[] | null = null;
  initPathData: PathData = null;
  attributesToStore = [PathDataPropertyKey, TransformPropertyKey];
  initialized = false;
  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData) {
    this.pathHandles =
      handle?.pathDataHandles?.filter((p) => p.node === this.node) || null;
    this.node = node;
    this.handle = handle;
    this.started = Utils.toElementPoint(this.node.getElement(), screenPos);

    this.transformElementCoordinates =
      this.handle.adorner.type === AdornerType.TransformedElement;
    if (this.propertiesService.isCenterTransformSet(node)) {
      this.attributesToStore.push(CenterTransformX);
      this.attributesToStore.push(CenterTransformY);
      this.centerTransform = Utils.toElementPoint(
        node,
        handle?.adorner?.screen?.centerTransform
      );
    }
  }

  applyMatrix(matrix: DOMMatrix): boolean {
    const isTransformed = this.transformInitialPathByMatrix(matrix);
    if (isTransformed) {
      if (this.centerTransform) {
        this.propertiesService.transformCenterByMatrix(
          this.node,
          matrix,
          this.centerTransform
        );
      }
    }
    return isTransformed;
  }

  /**
   * Scale element by a matrix in screen coordinates and convert it back to the element coordinates.
   * Usage: element is transformed by itself, you can compose screen matrix and apply it to the element directly.
   * @param screenScaleMatrix screen coordinates matrix.
   */
  scaleByScreenMatrix(screenScaleMatrix: DOMMatrix): boolean {
    const element = this.node.getElement();
    const parent = element.parentNode as SVGGraphicsElement;
    // Get original to screen matrix from which transformation was started (anchor for when screen coords are changed on pan)
    const toScreenMatrix = parent
      .getScreenCTM()
      .multiply(this.initTransformMatrix);

    const newTransformationMatrix = MatrixUtils.convertScreenMatrixToElementMatrix(
      screenScaleMatrix,
      toScreenMatrix,
      // Only when transformed element is used
      element.ownerSVGElement.createSVGMatrix()
    );

    // Apply new created transform back to the element:
    return this.applyMatrix(newTransformationMatrix);
  }
  transformByMouse(screenPos: DOMPoint): boolean {
    if (!this.initialized) {
      this.saveInitialValue();
      const initializedScreenPos = Utils.toScreenPoint(
        this.node.getElement(),
        this.started
      );
      if (!this.transformElementCoordinates) {
        this.untransform();
      }
      super.init(this.node, initializedScreenPos, this.handle);
      this.initialized = true;
    }
    return super.transformByMouse(screenPos);
  }
  /**
   * Apply matrix to originally stored path data.
   * @param matrix to be applied.
   */
  transformInitialPathByMatrix(matrix: DOMMatrix): boolean {
    if (!this.initPathData) {
      this.initPathData = this.node.getPathData(false);
    }
    const pathData = this.initPathData.clone();
    // matrix = matrix.multiply(transform?.matrix);
    const changed = PathDataUtils.transformPathByMatrix(
      pathData,
      matrix,
      this.pathHandles
    );
    if (changed) {
      this.node.setPathData(pathData);
    }
    return changed;
  }

  /**
   * Override. Remove transformations, keep current path data points at the same places.
   */
  untransform() {
    const element = this.node.getElement();
    const currentTransform = MatrixUtils.getMatrix(this.node);
    // Remove current transformation
    MatrixUtils.setMatrix(element, element.ownerSVGElement.createSVGMatrix());
    this.transformInitialPathByMatrix(currentTransform);
    this.node.cleanCache();
    this.initPathData = null;
  }
}
