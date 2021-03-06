import { Injectable } from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { PropertiesService } from "../properties.service";
import { Utils } from "../utils/utils";
import { BaseAction } from "./base-action";

/**
 * Undo/redo visibility toggle action
 */
@Injectable({
  providedIn: "root",
})
export class VisibilityAction extends BaseAction {
  items: TreeNode[] = [];
  initialStates: string[] = [];
  committed = true;
  constructor(private propertiesService: PropertiesService) {
    super();
  }
  execute(): void {
    this.items.forEach((p) =>
      this.propertiesService.setDisplay(p, !this.propertiesService.isVisible(p))
    );
  }
  undo(): void {
    this.items.forEach((p, index) =>
      this.propertiesService.setDisplay(p, this.initialStates[index])
    );
  }

  init(items: TreeNode[]) {
    this.items = items;
    this.title = `Visibility: ${Utils.getTreeNodesTitle(items)}`;
    this.icon = "visibility";
    this.initialStates = items.map(
      (p) => p?.getElement()?.style?.display || ""
    );
  }
}
