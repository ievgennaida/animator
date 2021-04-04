import { Injectable } from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { CommandsExecutorService } from "../commands/commands-services/commands-executor-service";
import { ScrollToSelected } from "../commands/scroll-to-selected";
import { DocumentService } from "../document.service";
import { LoggerService } from "../logger.service";
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
  title = "Paste";
  icon = "content_paste";
  tooltip = `Paste selected items`;
  committed = true;
  nodes: TreeNode[] | null = null;
  container: TreeNode | null = null;
  constructor(
    private viewService: ViewService,
    private outlineService: OutlineService,
    private commandExecutor: CommandsExecutorService,
    private documentService: DocumentService,
    private scrollToSelectedCommand: ScrollToSelected,
    private logger: LoggerService
  ) {
    super();
  }
  execute(): void {
    if (!this.nodes || !this.container) {
      return;
    }
    this.nodes.forEach(
      (node) =>
        this.container && Utils.addTreeNodeToContainer(node, this.container)
    );

    this.outlineService.update();
    this.commandExecutor.executeCommand(this.scrollToSelectedCommand);
  }
  undo(): void {
    if (!this.nodes || !this.container) {
      return;
    }
    // Should be executed in reverted order:
    this.nodes.forEach((node) => Utils.deleteTreeNode(node, node.parentNode));

    this.outlineService.update();
    this.commandExecutor.executeCommand(this.scrollToSelectedCommand);
  }
  cleanupElementsBeforePaste(node: Element | null): Element | null {
    if (node) {
      const rootPlayerElement = this.viewService?.viewport?.ownerDocument;
      if (rootPlayerElement && node.hasAttribute("id")) {
        const existingId = node.getAttribute("id");
        if (existingId) {
          const elementExists = rootPlayerElement.getElementById(existingId);
          // Remove if such id exists:
          if (elementExists) {
            node.removeAttribute("id");
          }
        }
      }
      if (node.children) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < node.children.length; i++) {
          const el = node.children[i] as Element;
          this.cleanupElementsBeforePaste(el);
        }
      }
    }
    return node;
  }
  init(container: TreeNode, nodes: TreeNode[]) {
    nodes = [...nodes]
      .filter((p) => !!p && !!p.getElement())
      .sort((a, b) => b.index - a.index);
    const parser = this.documentService?.documentSubject.getValue()?.parser;
    if (!parser) {
      return;
    }
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
