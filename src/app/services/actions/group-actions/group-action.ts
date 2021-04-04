import { Injectable } from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { ScrollToSelected } from "../../commands/scroll-to-selected";
import { LoggerService } from "../../logger.service";
import { OutlineService } from "../../outline.service";
import { Utils } from "../../utils/utils";
import { BaseAction } from "../base-action";
import { GroupMode } from "./group-mode";

/**
 * Order elements action
 */
@Injectable({
  providedIn: "root",
})
export class GroupAction extends BaseAction {
  icon = "remove";
  nodes: TreeNode[] | null = null;
  containers: TreeNode[] = [];
  mode: GroupMode = GroupMode.group;
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
    private scrollToSelectedCommand: ScrollToSelected,
    private logger: LoggerService
  ) {
    super();
  }
  execute(): void {}
  undo(): void {}

  init(nodes: TreeNode[], mode: GroupMode) {
    this.mode = mode;
    this.title = `${mode}: ${Utils.getTreeNodesTitle(nodes)}`;
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
        this.logger.warn(
          "Cannot perform order operation. Parent node cannot be found."
        );
      }
    });
  }
}
