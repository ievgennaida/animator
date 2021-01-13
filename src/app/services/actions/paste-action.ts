import { Injectable } from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { executeCommand } from "../commands/base-command";
import { ScrollToSelected } from "../commands/scroll-to-selected";
import { OutlineService } from "../outline.service";
import { Utils } from "../utils/utils";
import { BaseAction } from "./base-action";

/**
 * Order elements action
 */
@Injectable({
  providedIn: "root",
})
export class PasteAction extends BaseAction {
  constructor(
    private outlineService: OutlineService,
    private scrollToSelectedCommand: ScrollToSelected
  ) {
    super();
  }
  title = "Paste";
  icon = "content_paste";
  tooltip = `Paste selected items`;
  committed = true;
  nodes: TreeNode[] | null = null;
  container: TreeNode | null = null;

  execute() {
    this.nodes.forEach((node) => {
      Utils.addTreeNodeToContainer(node, this.container);
    });

    this.outlineService.update();
    executeCommand(this.scrollToSelectedCommand);
  }
  undo() {
    // Should be executed in reverted order:
    this.nodes.forEach((node) => Utils.deleteTreeNode(node, node.parentNode));

    this.outlineService.update();
    executeCommand(this.scrollToSelectedCommand);
  }

  init(container: TreeNode, nodes: TreeNode[]) {
    this.nodes = [...nodes].sort((a, b) => b.index - a.index);

    this.title = `Paste ${Utils.getTreeNodesTitle(
      nodes
    )} -> ${Utils.getTreeNodesTitle([container])}`;
    this.container = container;
  }
}
