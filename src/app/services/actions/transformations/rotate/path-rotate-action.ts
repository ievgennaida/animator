import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { PathDataHandle } from "src/app/models/path-data-handle";
import { PathType } from "src/app/models/path/path-type";
import { TreeNode } from "src/app/models/tree-node";
import { LoggerService } from "src/app/services/logger.service";
import {
  CenterTransformX,
  CenterTransformY,
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
export class PathRotateAction extends BaseTransformAction {
  title = "Rotate";
  icon = TransformationModeIcon.rotate;
  prevAngle = 0;
  transformOrigin: DOMPoint | null = null;
  startOffset = 0;
  centerTransform: DOMPoint | null = null;
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
    this.centerTransform = this.propertiesService.getCenterTransform(
      this.node,
      false
    );
    this.pathHandles = handle?.getHandlesByNode(node);
    const element = this.node.getElement();
    const adornerScreen = handle?.adorner?.screen;
    this.transformOrigin = Utils.toElementPoint(
      node,
      adornerScreen?.getCenterTransformOrDefault() || null
    );
    const transformedCenter = Utils.toScreenPoint(
      element,
      this.transformOrigin
    );
    if (transformedCenter) {
      this.startOffset = -Utils.angle(transformedCenter, screenPos);
    }
  }

  /**
   * Rotate by mouse.
   *
   * @param screenPos mouse current move position point.
   */
  transformByMouse(screenPos: DOMPoint): boolean {
    const element = this.node?.getElement();
    if (!this.node || !element || !this.transformOrigin) {
      this.logger.log(
        "Element cannot be transformed. Should be initialized first"
      );
      return false;
    }
    const screenTransformOrigin = Utils.toScreenPoint(
      element,
      this.transformOrigin
    );
    if (!screenTransformOrigin) {
      this.logger.log("Cannot transform transform origin to screen origin.");
      return false;
    }
    let angle = -Utils.angle(screenTransformOrigin, screenPos);
    angle -= this.startOffset;
    const angleBefore = angle;
    angle -= this.prevAngle;
    const changed = this.rotateOffset(angle, this.transformOrigin);
    this.prevAngle = angleBefore;
    return changed;
  }
  rotateOffset(angle: number, transformPoint: DOMPoint) {
    const element = this.node?.getElement();
    if (!this.node || !element || !element.ownerSVGElement) {
      this.logger.log(
        "Element cannot be transformed. Should be initialized first"
      );
      return false;
    }
    if (this.initialValues.size === 0) {
      this.saveInitialValues(
        [this.node],
        [PathDataPropertyKey, CenterTransformX, CenterTransformY]
      );
    }
    const matrix = element.ownerSVGElement
      .createSVGMatrix()
      .translate(transformPoint.x, transformPoint.y)
      .rotate(angle, 0)
      .translate(-transformPoint.x, -transformPoint.y);
    const pathData = this.node.getPathData();
    if (!pathData) {
      this.logger.warn(
        "Element cannot be moved. Path data should be specified"
      );
      return false;
    }
    pathData.normalize([
      PathType.horizontal,
      PathType.vertical,
      PathType.horizontalAbs,
      PathType.verticalAbs,
    ]);
    const changed = PathDataUtils.transformPathByMatrix(
      pathData,
      matrix,
      this.pathHandles
    );
    if (changed) {
      this.propertiesService.setPathData(this.node, pathData);
      if (this.centerTransform) {
        this.propertiesService.transformCenterByMatrix(
          this.node,
          matrix,
          this.centerTransform
        );
      }
    }
    return changed;
  }
}
