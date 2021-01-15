import { Injectable } from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { executeCommand } from "../commands/base-command";
import { ScrollToSelected } from "../commands/scroll-to-selected";
import { DocumentService } from "../document.service";
import { OutlineService } from "../outline.service";
import { Utils } from "../utils/utils";
import { ViewService } from "../view.service";
import { BaseAction } from "./base-action";

/**
 * Order elements action
 */
@Injectable({
  providedIn: "root",
})
export class PasteAction extends BaseAction {
  constructor(
    private viewService: ViewService,
    private outlineService: OutlineService,
    private documentService: DocumentService,
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
  cleanupElementsBeforePaste(node: Element): Element {
    if (node) {
      if (node.hasAttribute("id")) {
        const existingId = node.getAttribute("id");
        const elementExists = this.viewService.viewport.ownerDocument.getElementById(
          existingId
        );
        // Remove if such id exists:
        if (elementExists) {
          node.removeAttribute("id");
        }
      }
    }
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        const el = node.children[i] as Element;
        this.cleanupElementsBeforePaste(el);
      }
    }
    return node;
  }
  init(container: TreeNode, nodes: TreeNode[]) {
    nodes = [...nodes]
      .filter((p) => !!p && !!p.getElement())
      .sort((a, b) => b.index - a.index);
    const parser = this.documentService.documentSubject.getValue().parser;
    this.nodes = nodes.map((bufferItem) => {
      const clonedNode = parser.clone(bufferItem, true);
      this.cleanupElementsBeforePaste(clonedNode.getElement());
      return clonedNode;
    });
    this.title = `Paste ${Utils.getTreeNodesTitle(
      nodes
    )} -> ${Utils.getTreeNodesTitle([container])}`;
    this.container = container;
  }
}
