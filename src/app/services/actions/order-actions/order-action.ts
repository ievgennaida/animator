import { Injectable } from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { CommandsExecutorService } from "../../commands/commands-services/commands-executor-service";
import { ScrollToSelected } from "../../commands/scroll-to-selected";
import { LoggerService } from "../../logger.service";
import { OutlineService } from "../../outline.service";
import { Utils } from "../../utils/utils";
import { BaseAction } from "../base-action";
import { OrderMode } from "./order-mode";

/**
 * Order elements action
 */
@Injectable({
  providedIn: "root",
})
export class OrderAction extends BaseAction {
  icon = "import_export";
  nodes: TreeNode[] = [];
  containers: TreeNode[] = [];
  mode: OrderMode = OrderMode.front;
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
    private commandExecutor: CommandsExecutorService,
    private logger: LoggerService
  ) {
    super();
  }
  static canSendToBottom(nodes: TreeNode[]): boolean {
    if (!nodes || nodes.length <= 0) {
      return false;
    }

    const unmovableNode = nodes.find(
      (p) =>
        !p ||
        !p.parentNode ||
        (p?.parentNode?.children?.length || -1) <= 1 ||
        p.index <= 0
    );
    // Found element that already in front;
    if (unmovableNode) {
      return false;
    }

    if (!Utils.isSameParent(nodes)) {
      return false;
    }
    return true;
  }

  static canSendToFront(nodes: TreeNode[]): boolean {
    if (!nodes || nodes.length <= 0) {
      return false;
    }

    const unmovableNode = nodes.find(
      (p) =>
        !p ||
        !p.parentNode ||
        p?.parentNode?.children?.length ||
        -1 <= 1 ||
        p.index === (p?.parentNode?.children?.length || -1) - 1
    );

    // Found element that already in front;
    if (unmovableNode) {
      return false;
    }

    if (!Utils.isSameParent(nodes)) {
      return false;
    }
    return true;
  }
  execute(): void {
    this.nodes.forEach((node, index) => {
      const container = node.parentNode;
      if (!container || !container.children) {
        this.logger.warn(
          `Cannot perform order operation for the selected node ${node.name}. Node parent cannot be found.`
        );
        return;
      }
      let expectedIndex = node.index;
      if (this.mode === OrderMode.oneStepBackwards) {
        expectedIndex--;
      } else if (this.mode === OrderMode.oneStepForwards) {
        expectedIndex++;
      } else if (this.mode === OrderMode.front) {
        expectedIndex = container?.children.length - 1 || -1;
      } else if (this.mode === OrderMode.back) {
        expectedIndex = 0;
      }
      if (expectedIndex < 0) {
        this.logger.warn(
          `Cannot perform order operation. Index is out of the bounds.`
        );
        return;
      }
      const nextTreeNode = container.children[expectedIndex];
      const domIndex = nextTreeNode.indexDOM;
      Utils.deleteTreeNode(node, container);
      Utils.addTreeNodeToContainer(node, container, expectedIndex, domIndex);
    });

    this.outlineService.update();
    this.commandExecutor.executeCommand(this.scrollToSelectedCommand);
  }
  undo(): void {
    // Should be executed in reverted order:
    const nodes = this.nodes.reverse();
    const containers = this.containers.reverse();
    const treeNodeIndex = this.treeNodeIndex.reverse();
    const indexes = this.indexes.reverse();

    nodes.forEach((node, index) => {
      const virtualDOMIndex = treeNodeIndex[index];
      const htmlIndex = indexes[index];
      const container = containers[index];
      Utils.deleteTreeNode(node);
      Utils.addTreeNodeToContainer(node, container, virtualDOMIndex, htmlIndex);
    });

    this.outlineService.update();
    this.commandExecutor.executeCommand(this.scrollToSelectedCommand);
  }

  init(nodes: TreeNode[], mode: OrderMode) {
    nodes = [...nodes];
    this.mode = mode;
    // Should be sorted by index, to move multiple items
    if (mode === OrderMode.front || mode === OrderMode.oneStepForwards) {
      nodes = nodes.sort((a, b) => b.index - a.index);
    } else {
      nodes = nodes.sort((a, b) => a.index - b.index);
    }

    this.title = `Order: ${mode} ${Utils.getTreeNodesTitle(nodes)}`;
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
