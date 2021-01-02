import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { PathDataHandle } from "src/app/models/path-data-handle";
import { PathType } from "src/app/models/path/path-type";
import { TreeNode } from "src/app/models/tree-node";
import {
  CenterTransformX,
  CenterTransformY,
  PathDataPropertyKey,
  PropertiesService,
} from "src/app/services/properties.service";
import { Utils } from "src/app/services/utils/utils";
import { PathDataUtils } from "../../../utils/matrix-utils";
import { BaseTransformAction } from "../base-transform-action";
import { TransformationModeIcon } from "../transformation-mode";

@Injectable({
  providedIn: "root",
})
export class PathRotateAction extends BaseTransformAction {
  constructor(propertiesService: PropertiesService) {
    super(propertiesService);
  }
  title = "Rotate";
  icon = TransformationModeIcon.Rotate;
  prevAngle = 0;
  transformOrigin: DOMPoint = null;
  startOffset = 0;
  centerTransform: DOMPoint = null;
  /**
   * List of a particular path handles to be transformed. (filter)
   */
  public pathHandles: PathDataHandle[] | null = null;
  start: DOMPoint = null;

  attributesToStore = [PathDataPropertyKey];

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
      adornerScreen?.centerTransform || adornerScreen?.center
    );
    if (this.propertiesService.isCenterTransformSet(node)) {
      this.attributesToStore.push(CenterTransformX);
      this.attributesToStore.push(CenterTransformY);
    }
    const transformedCenter = Utils.toScreenPoint(
      element,
      this.transformOrigin
    );
    this.startOffset = -Utils.angle(transformedCenter, screenPos);
  }

  /**
   * Rotate by mouse.
   * @param screenPos mouse current move position point.
   */
  transformByMouse(screenPos: DOMPoint): boolean {
    const transformPoint = this.transformOrigin;
    const element = this.node.getElement();
    const screenTransformOrigin = Utils.toScreenPoint(element, transformPoint);
    let angle = -Utils.angle(screenTransformOrigin, screenPos);

    angle -= this.startOffset;
    const angleBefore = angle;
    angle -= this.prevAngle;
    const changed = this.rotateOffset(angle, transformPoint);
    this.prevAngle = angleBefore;
    return changed;
  }
  rotateOffset(angle: number, transformPoint: DOMPoint) {
    const element = this.node.getElement();
    this.saveInitialValue();

    const matrix = element.ownerSVGElement
      .createSVGMatrix()
      .translate(transformPoint.x, transformPoint.y)
      .rotate(angle, 0)
      .translate(-transformPoint.x, -transformPoint.y);
    const pathData = this.node.getPathData();
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
      this.node.setPathData(pathData);
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
