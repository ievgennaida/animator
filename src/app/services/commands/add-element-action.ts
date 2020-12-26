import { Injectable } from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { OutlineService } from "../outline.service";
import { SelectionService } from "../selection.service";
import { Utils } from "../utils/utils";
import { BaseAction } from "./base-action";

/**
 * Undo/redo add element action
 */
@Injectable({
  providedIn: "root",
})
export class AddElementAction extends BaseAction {
  constructor(
    private selectionService: SelectionService,
    private outlineService: OutlineService
  ) {
    super();
  }
  container: TreeNode;
  element: TreeNode;
  do() {
    const htmlElement = this.container.getElement();
    htmlElement.appendChild(this.element.getElement());
    this.container.children.push(this.element);
    this.outlineService.update();
  }
  undo() {
    // Ensure that selected nodes exists:
    // this.selectionService.setSelected(newTreeNode);
    const htmlElement = this.container.getElement();
    htmlElement.removeChild(this.element.getElement());
    Utils.deleteElement(this.container.children, this.element);
    this.outlineService.update();
  }

  init(container: TreeNode, element: TreeNode) {
    this.container = container;
    this.element = element;
    this.title = `Add ${element.name}`;
    this.icon = element.icon;
  }
}
