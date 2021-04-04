import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { PropertiesService } from "../../properties.service";
import { BasePropertiesStorageAction } from "../base-property-action";

export abstract class BaseTransformAction extends BasePropertiesStorageAction {
  committed = false;
  node: TreeNode | null = null;
  handle: HandleData | null = null;

  /**
   * Set points to be displayed.
   */
  debugPoints: DOMPoint[] = [];
  constructor(protected propertiesService: PropertiesService) {
    super(propertiesService);
  }
  getScreenTransformOrigin(): DOMPoint | null {
    const screen = this.handle?.adorner?.screen;
    if (!screen) {
      return null;
    }
    return screen.centerTransform || screen.center;
  }

  abstract init(
    node: TreeNode,
    screenPos: DOMPoint | null,
    handle: HandleData | null
  ): void;
  abstract transformByMouse(screenPos: DOMPoint): boolean;
}
