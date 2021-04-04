import { Injectable } from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { OutlineService } from "../outline.service";
import { Utils } from "../utils/utils";
import { BaseAction } from "./base-action";

/**
 * Undo/redo add element action
 */
@Injectable({
  providedIn: "root",
})
export class AddElementAction extends BaseAction {
  container: TreeNode | null = null;
  element: TreeNode | null = null;
  committed = true;
  constructor(private outlineService: OutlineService) {
    super();
  }
  execute(): void {
    if (!this.element || !this.container) {
      return;
    }
    Utils.addTreeNodeToContainer(this.element, this.container);
    this.outlineService.update();
  }
  undo(): void {
    if (!this.element || !this.container) {
      return;
    }
    // Ensure that selected nodes exists:
    // this.selectionService.setSelected(newTreeNode);
    Utils.deleteTreeNode(this.element, this.container);
    this.outlineService.update();
  }

  init(container: TreeNode, element: TreeNode): void {
    this.container = container;
    this.element = element;
    this.title = `Add ${element.name}`;
    this.icon = element.icon;
  }
}
