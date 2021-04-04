import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { PathDataHandle } from "src/app/models/path-data-handle";
import { TreeNode } from "src/app/models/tree-node";
import { LoggerService } from "src/app/services/logger.service";
import {
  PathDataPropertyKey,
  PropertiesService,
} from "src/app/services/properties.service";
import { PathDataUtils } from "src/app/services/utils/path-data-utils";
import { Utils } from "src/app/services/utils/utils";
import { TransformationModeIcon } from "../../../../models/transformation-mode";
import { BaseTransformAction } from "../base-transform-action";
@Injectable({
  providedIn: "root",
})
export class PathTranslateAction extends BaseTransformAction {
  title = "Move";
  icon = TransformationModeIcon.move;
  /**
   * List of a particular path handles to be transformed. (filter)
   */
  public pathHandles: PathDataHandle[] | null = null;
  start: DOMPoint | null = null;
  constructor(
    propertiesService: PropertiesService,
    private logger: LoggerService
  ) {
    super(propertiesService);
  }

  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData) {
    this.node = node;
    this.start = Utils.toElementPoint(node.getElement(), screenPos);
    this.pathHandles = handle?.getHandlesByNode(node);
  }
  //    this.pathHandles = handle.pathDataHandles.filter((p) => p.node === this.node);
  transformByMouse(screenPos: DOMPoint): boolean {
    const element = this.node?.getElement();
    if (!element) {
      return false;
    }
    const elementPoint = Utils.toElementPoint(element, screenPos);
    if (!elementPoint) {
      return false;
    }

    const isChanged = this.offset(elementPoint.x, elementPoint.y);
    this.start = elementPoint;
    return isChanged;
  }

  offset(x: number, y: number): boolean {
    if (!this.start || !this.node) {
      this.logger.warn(
        "Element cannot be moved. Action should be initialized first"
      );
      return false;
    }
    // Translate by offset
    const offsetX = x - this.start.x;
    const offsetY = y - this.start.y;
    if (!offsetX && !offsetY) {
      return false;
    }
    if (this.initialValues.size === 0) {
      this.saveInitialValues([this.node], [PathDataPropertyKey]);
    }
    const element = this.node.getElement();
    if (!element || !element.ownerSVGElement) {
      this.logger.warn(
        "Element cannot be moved. Should exists and should be part of the SVG document"
      );
      return false;
    }
    const matrix = element.ownerSVGElement
      .createSVGMatrix()
      .translate(offsetX, offsetY);
    const pathData = this.node.getPathData();
    if (!pathData) {
      this.logger.warn(
        "Element cannot be moved. Path data should be specified"
      );
      return false;
    }
    const changed = PathDataUtils.transformPathByMatrix(
      pathData,
      matrix,
      this.pathHandles
    );
    if (changed) {
      this.propertiesService.setPathData(this.node, pathData);
    }
    return changed;
  }
}
