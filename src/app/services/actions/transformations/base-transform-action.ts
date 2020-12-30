import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { PropertiesService } from "../../properties.service";
import { BaseAction } from "../base-action";

export abstract class BaseTransformAction extends BaseAction {
  constructor(protected propertiesService: PropertiesService) {
    super();
  }

  committed = true;
  node: TreeNode | null = null;
  handle: HandleData | null = null;
  /**
   *  List of attributes to be stored for he undo service.
   */
  attributesToStore: string[] | null = null;
  initialValues = new Map<string, any>();
  committedValues = new Map<string, any>();

  /**
   * Set points to be displayed.
   */
  debugPoints: DOMPoint[] = [];
  saveInitialValue() {
    if (!this.initialValues || this.initialValues.size === 0) {
      this.initialValues = this.propertiesService.getAttributes(
        this.node,
        this.attributesToStore
      );
    }
  }
  abstract init(
    node: TreeNode,
    screenPos: DOMPoint | null,
    handle: HandleData | null
  ): void;
  abstract transformByMouse(screenPos: DOMPoint): boolean;
  execute() {
    if (!this.committed) {
      throw new Error("Cannot execute uncommitted value");
    }
    if (this.committedValues && this.committedValues.size > 0) {
      this.propertiesService.setAttributes(this.node, this.committedValues);
    }
  }
  undo() {
    if (this.initialValues && this.initialValues.size > 0) {
      this.propertiesService.setAttributes(this.node, this.initialValues);
    }
  }
  commit() {
    this.committed = true;
    if (this.attributesToStore) {
      this.committedValues = this.propertiesService.getAttributes(
        this.node,
        this.attributesToStore
      );
    }
  }
}
