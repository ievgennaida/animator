import { Injectable } from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { CommandsExecutorService } from "../../commands/commands-services/commands-executor-service";
import { ScrollToSelected } from "../../commands/scroll-to-selected";
import { OutlineService } from "../../outline.service";
import { Utils } from "../../utils/utils";
import { BaseAction } from "../base-action";

export enum OrderMode {
  Front = "To Front",
  Back = "To Back",
  OneStepForwards = "Step Forward",
  OneStepBackwards = "Step Backward",
}
/**
 * Order elements action
 */
@Injectable({
  providedIn: "root",
})
export class OrderAction extends BaseAction {
  constructor(
    private outlineService: OutlineService,
    private scrollToSelectedCommand: ScrollToSelected,
    private commandExecutor: CommandsExecutorService
  ) {
    super();
  }
  icon = "import_export";
  nodes: TreeNode[] | null = null;
  containers: TreeNode[] = [];
  mode: OrderMode;
  committed = true;
  /**
   * Store virtual dom indexes.
   */
  treeNodeIndex: number[] = [];
  /**
   * Real elements indexes (can be different from virtual dom)
   */
  indexes: number[] = [];

  static canSendToBottom(nodes: TreeNode[]): boolean {
    if (!nodes || nodes.length <= 0) {
      return false;
    }

    const unmovableNode = nodes.find(
      (p) =>
        !p ||
        !p.parentNode ||
        p?.parentNode?.children?.length <= 1 ||
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
        p?.parentNode?.children?.length <= 1 ||
        p.index === p?.parentNode?.children?.length - 1
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
  execute() {
    this.nodes.forEach((node, index) => {
      const container = node.parentNode;
      let expectedIndex = node.index;
      if (this.mode === OrderMode.OneStepBackwards) {
        expectedIndex--;
      } else if (this.mode === OrderMode.OneStepForwards) {
        expectedIndex++;
      } else if (this.mode === OrderMode.Front) {
        expectedIndex = container.children.length - 1;
      } else if (this.mode === OrderMode.Back) {
        expectedIndex = 0;
      }

      const nextTreeNode = container.children[expectedIndex];
      const domIndex = nextTreeNode.indexDOM;
      Utils.deleteTreeNode(node, container);
      Utils.addTreeNodeToContainer(node, container, expectedIndex, domIndex);
    });

    this.outlineService.update();
    this.commandExecutor.executeCommand(this.scrollToSelectedCommand);
  }
  undo() {
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
    if (mode === OrderMode.Front || mode === OrderMode.OneStepForwards) {
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
      this.containers.push(parent);
      this.treeNodeIndex.push(node.index);
      this.indexes.push(node.indexDOM);
    });
  }
}
