import { Injectable } from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { LoggerService } from "../logger.service";
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
  icon = "clear";
  nodes: TreeNode[] = [];
  containers: TreeNode[] = [];
  committed = true;
  /**
   * Store virtual dom indexes.
   */
  treeNodeIndex: number[] = [];
  /**
   * Real elements indexes (can be different from virtual dom)
   */
  indexes: number[] = [];
  constructor(
    private outlineService: OutlineService,
    private logger: LoggerService
  ) {
    super();
  }
  execute(): void {
    this.nodes.forEach((node, index) => {
      const container = this.containers[index];
      Utils.deleteTreeNode(node, container);
    });

    this.outlineService.update();
  }
  undo(): void {
    this.nodes.forEach((node, index) => {
      const treeNodeIndex = this.treeNodeIndex[index];
      const htmlIndex = this.indexes[index];
      const container = this.containers[index];
      Utils.addTreeNodeToContainer(node, container, treeNodeIndex, htmlIndex);
    });

    this.outlineService.update();
  }

  init(nodes: TreeNode[]) {
    // Important, clone the reference to keep it for undo service
    nodes = [...nodes];
    this.title = `Remove: ${Utils.getTreeNodesTitle(nodes)}`;

    this.nodes = nodes;
    this.containers = [];
    this.treeNodeIndex = [];
    this.indexes = [];
    this.nodes.forEach((node) => {
      const parent = node.parentNode;
      if (parent) {
        this.containers.push(parent);
        this.treeNodeIndex.push(node.index);
        this.indexes.push(node.indexDOM);
      } else {
        this.logger.warn("Remove element: Cannot init node with null parent.");
      }
    });
  }
}
