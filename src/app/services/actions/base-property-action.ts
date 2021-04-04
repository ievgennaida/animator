import { TreeNode } from "src/app/models/tree-node";
import { PropertiesService } from "../properties.service";
import { BaseAction } from "./base-action";

/**
 * Base action that can used to store properties for the undo service.
 */
export abstract class BasePropertiesStorageAction extends BaseAction {
  committed = false;
  initialValues = new Map<TreeNode, Map<string, any>>();
  committedValues = new Map<TreeNode, Map<string, any>>();
  constructor(protected propertiesService: PropertiesService) {
    super();
  }
  saveInitialValues(nodes: TreeNode[], attributesToStore: string[]) {
    if (
      !this.initialValues ||
      (this.initialValues.size === 0 && attributesToStore)
    ) {
      nodes.forEach((node) => {
        const values = this.propertiesService.getAttributes(
          node,
          attributesToStore
        );

        this.initialValues.set(node, values);
      });
    }
  }

  execute(): void {
    if (!this.committed) {
      throw new Error(`Cannot execute uncommitted value ${this.title}`);
    }
    this.setValues(this.committedValues);
  }
  setValues(map: Map<TreeNode, Map<string, any>>) {
    if (map && map.size > 0) {
      map.forEach((values, node) => {
        if (values && values.size > 0) {
          this.propertiesService.setAttributes(node, values);
        }
      });
    }
  }
  undo(): void {
    this.setValues(this.initialValues);
  }
  /**
   * Make a snapshot of current values.
   */
  commit() {
    this.committed = true;
    if (this.initialValues && this.initialValues.size > 0) {
      this.initialValues.forEach((values, node) => {
        const attributesToStore = [...values.keys()];
        const savedValues = this.propertiesService.getAttributes(
          node,
          attributesToStore
        );
        this.committedValues.set(node, savedValues);
      });
    }
  }
}
