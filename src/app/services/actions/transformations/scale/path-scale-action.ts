import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { PathDataHandle } from "src/app/models/path-data-handle";
import { PathData } from "src/app/models/path/path-data";
import { TreeNode } from "src/app/models/tree-node";
import { PropertiesService } from "src/app/services/properties.service";
import { Utils } from "src/app/services/utils/utils";
import { AdornerMode } from "src/app/services/viewport/adorners/adorner";
import { MatrixUtils, PathDataUtils } from "../../../utils/matrix-utils";
import { MatrixScaleAction } from "./matrix-scale-action";

@Injectable({
  providedIn: "root",
})
export class PathScaleAction extends MatrixScaleAction {
  constructor(propertiesService: PropertiesService) {
    super(propertiesService);
  }

  started: DOMPoint | null = null;
  /**
   * List of a particular path handles to be transformed.
   */
  public pathHandles: PathDataHandle[] | null = null;
  initPathData: PathData = null;
  attributesToStore = ["d", MatrixUtils.TransformPropertyKey];
  initialized = false;
  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData) {
    this.pathHandles =
      handle?.pathDataHandles?.filter((p) => p.node === this.node) || null;
    this.node = node;
    this.handle = handle;
    this.started = Utils.toElementPoint(this.node.getElement(), screenPos);
    // TODO: read from the config
    this.transformElementCoordinates =
      this.handle.adorner.mode === AdornerMode.TransformedElement;
  }

  applyMatrix(matrix: DOMMatrix, offset: boolean): boolean {
    return this.transformInitialPathByMatrix(matrix);
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
    return this.applyMatrix(newTransformationMatrix, false);
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
    Utils.setMatrix(element, element.ownerSVGElement.createSVGMatrix());
    this.transformInitialPathByMatrix(currentTransform);
    this.node.cleanCache();
    this.initPathData = null;
  }
}
