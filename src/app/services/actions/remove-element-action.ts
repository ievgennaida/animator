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
export class RemoveElementAction extends BaseAction {
  constructor(private outlineService: OutlineService) {
    super();
  }
  icon = "clear";
  nodes: TreeNode[] | null = null;
  containers: TreeNode[] = [];

  /**
   * Store virtual dom indexes.
   */
  treeNodeIndex: number[] = [];
  /**
   * Real elements indexes.
   */
  indexes: number[] = [];

  execute() {
    this.nodes.forEach((node, index) => {
      const container = node[index];
      Utils.deleteTreeNode(node, container);
    });

    this.outlineService.update();
  }
  undo() {
    this.nodes.forEach((node, index) => {
      const treeNodeIndex = this.treeNodeIndex[index];
      const htmlIndex = this.indexes[index];
      const container = this.containers[index];
      Utils.addTreeNodeToContainer(node, container, treeNodeIndex, htmlIndex);
    });

    this.outlineService.update();
  }

  init(nodes: TreeNode[]) {
    if (nodes.length === 1) {
      this.title = `Remove: ${nodes[0].name}`;
    } else {
      this.title = `Remove: items (${nodes.length})`;
    }

    this.nodes = nodes;
    this.containers = [];
    this.treeNodeIndex = [];
    this.indexes = [];
    this.nodes.forEach((node) => {
      const parent = node.parentNode;
      this.containers.push(parent);
      const treeIndex = parent.children.indexOf(node);
      if (treeIndex >= 0) {
        this.treeNodeIndex.push(treeIndex);
      }
      const element = node.getElement();
      const index = Utils.getElementIndex(element);
      if (index >= 0) {
        this.indexes.push(index);
      }
    });
  }
}
