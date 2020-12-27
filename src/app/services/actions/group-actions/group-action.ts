import { Injectable } from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { ScrollToSelected } from "../../commands/scroll-to-selected";
import { OutlineService } from "../../outline.service";
import { BaseAction } from "../base-action";

export enum GroupMode {
  Group = "Group",
  UnGroup = "Ungroup",
}
/**
 * Order elements action
 */
@Injectable({
  providedIn: "root",
})
export class GroupAction extends BaseAction {
  constructor(
    private outlineService: OutlineService,
    private scrollToSelectedCommand: ScrollToSelected
  ) {
    super();
  }
  icon = "remove";
  nodes: TreeNode[] | null = null;
  containers: TreeNode[] = [];
  mode: GroupMode;

  /**
   * Store virtual dom indexes.
   */
  treeNodeIndex: number[] = [];

  /**
   * Real elements indexes (can be different from virtual dom)
   */
  indexes: number[] = [];

  execute() {}
  undo() {}

  init(nodes: TreeNode[], mode: GroupMode) {
    this.mode = mode;
    if (nodes.length === 1) {
      this.title = `${mode}: ${nodes[0].name}`;
    } else {
      this.title = `${mode}: items (${nodes.length})`;
    }

    this.nodes = nodes;
    this.containers = [];
    this.treeNodeIndex = [];
    this.indexes = [];
    this.nodes.forEach((node) => {
      const parent = node.parentNode;
      this.containers.push(parent);
      this.treeNodeIndex.push(node.index);
      this.indexes.push(node.indexDOM);
    });
  }
}
