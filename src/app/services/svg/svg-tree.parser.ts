import { InputDocument } from "src/app/models/input-document";
import { IParser } from "src/app/models/interfaces/parser";
import { TreeNode } from "../../models/tree-node";

export class SvgTreeParser implements IParser {
  allowed = [
    "a",
    "circle",
    "ellipse",
    "foreignObject",
    "g",
    "image",
    "line",
    "mesh",
    "path",
    "polygon",
    "polyline",
    "rect",
    "svg",
    "switch",
    "symbol",
    "text",
    "textPath",
    "tspan",
    "unknown",
    "use",
  ];

  parse(document: InputDocument): TreeNode[] {
    const element = document.parsedData as HTMLElement;
    if (!element) {
      return;
    }

    // Represent root node:
    const svgRootNode = this.convertTreeNode(element);
    svgRootNode.transformable = false;
    svgRootNode.allowDelete = false;
    svgRootNode.icon = "assignment";
    svgRootNode.name = document.title;
    svgRootNode.isRoot = true;
    svgRootNode.expanded = true;
    const collection = [svgRootNode];
    this.addChildNodes(svgRootNode, svgRootNode.children, element);
    return collection;
  }
  isContainer(node: TreeNode): boolean {
    if (!node) {
      return false;
    }
    if (node.type === "svg" || node.type === "g") {
      return true;
    }
    return false;
  }

  /**
   * Build flat tree from the items.
   */
  buildFlat(item: TreeNode, collection?: TreeNode[]): TreeNode[] {
    if (!item) {
      return collection;
    }
    if (!collection) {
      collection = [];
    }
    collection.push(item);
    if (item && item.children && item.children.length > 0) {
      item.children.forEach((child) => {
        this.buildFlat(child, collection);
      });
    }
    return collection;
  }

  /**
   * Convert element to treeNode.
   * @param el element to be converted.
   */
  convertTreeNode(elArgs: any): TreeNode {
    const el = elArgs as HTMLElement;
    const currentNode = new TreeNode();

    // custom label attribute:
    currentNode.name = el.getAttribute("label") || el.id || `[${el.nodeName}]`;
    currentNode.tag = el;
    const tagName = el.tagName.toLowerCase();
    currentNode.nodeName = el.nodeName;
    currentNode.type = tagName;
    if (tagName === "circle") {
      currentNode.icon = "fiber_manual_record";
    } else if (tagName === "rect") {
      currentNode.icon = "crop_square";
    } else if (tagName === "svg") {
      currentNode.icon = "folder_special";
    } else if (tagName === "path") {
      currentNode.icon = "timeline";
    } else if (tagName === "polygon") {
      currentNode.icon = "star_border";
    } else if (tagName === "tspan") {
      currentNode.icon = "text_fields";
      currentNode.allowRotate = false;
      currentNode.allowResize = false;
    } else if (tagName === "text") {
      currentNode.icon = "text_fields";
    } else if (tagName === "textpath") {
      currentNode.icon = "text_fields";
    }
    return currentNode;
  }
  addChildNodes(
    parent: TreeNode,
    collection: TreeNode[],
    element: HTMLElement
  ): TreeNode[] {
    if (!element) {
      return;
    }

    const converted = element as HTMLElement;
    if (!converted) {
      return;
    }

    element.childNodes.forEach((childElement) => {
      if (childElement.nodeType !== 1) {
        return;
      }

      const el = childElement as HTMLElement;
      if (!el || !this.allowed.includes(el.nodeName)) {
        return;
      }

      const currentNode = this.convertTreeNode(el);
      currentNode.parent = parent;
      this.addChildNodes(currentNode, currentNode.children, el);
      collection.push(currentNode);
    });
    return collection;
  }
}
