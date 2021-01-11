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
import { AdornerType } from "src/app/models/adorner-type";
import { MatrixUtils, PathDataUtils } from "../../../utils/matrix-utils";
import { TransformationModeIcon } from "../../../../models/transformation-mode";
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
  untransformOnStart = false;
  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData) {
    this.node = node;
    this.handle = handle;
    this.pathHandles = handle?.getHandlesByNode(node);
    this.started = Utils.toElementPoint(this.node.getElement(), screenPos);

    this.untransformOnStart =
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
    const isTransformed = this.transformInitialPathByMatrix(
      matrix,
      this.pathHandles
    );
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
      if (this.initialValues.size === 0) {
        this.saveInitialValues([this.node], this.attributesToStore);
      }
      const initializedScreenPos = Utils.toScreenPoint(
        this.node.getElement(),
        this.started
      );
      // this.untransform();
      // Delayed initialization:
      super.init(this.node, initializedScreenPos, this.handle);

      this.initialized = true;
    }
    return super.transformByMouse(screenPos);
  }
  /**
   * Apply matrix to originally stored path data.
   * @param matrix to be applied.
   */
  transformInitialPathByMatrix(
    matrix: DOMMatrix,
    filters: PathDataHandle[] | null = null
  ): boolean {
    if (!this.initPathData) {
      this.initPathData = this.node.getPathData(false);
    }
    const pathData = this.initPathData.clone();
    // matrix = matrix.multiply(transform?.matrix);
    const changed = PathDataUtils.transformPathByMatrix(
      pathData,
      matrix,
      filters
    );
    if (changed) {
      this.propertiesService.setPathData(this.node, pathData);
    }
    return changed;
  }

  /**
   * Override. Remove transformations, keep current path data points at the same places.
   */
  untransform() {
    const element = this.node.getElement();
    const currentTransform = MatrixUtils.getMatrix(this.node);
    // Remove current transformation from the node.
    this.propertiesService.setMatrixTransform(
      this.node,
      element.ownerSVGElement.createSVGMatrix()
    );
    // No need to pass matrix:
    this.transformInitialPathByMatrix(currentTransform, null);
    this.node.cleanCache();
    this.initPathData = null;
  }
}
