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
  constructor(private outlineService: OutlineService) {
    super();
  }
  container: TreeNode;
  element: TreeNode;
  execute() {
    Utils.addTreeNodeToContainer(this.element, this.container);
    this.outlineService.update();
  }
  undo() {
    // Ensure that selected nodes exists:
    // this.selectionService.setSelected(newTreeNode);
    Utils.deleteTreeNode(this.element, this.container);
    this.outlineService.update();
  }

  init(container: TreeNode, element: TreeNode) {
    this.container = container;
    this.element = element;
    this.title = `Add ${element.name}`;
    this.icon = element.icon;
  }
}
