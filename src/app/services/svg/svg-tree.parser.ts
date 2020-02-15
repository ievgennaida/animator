import { Injectable } from "@angular/core";
import { TreeNode } from "../../models/tree-node";
import { InputDocument } from "src/app/models/input-document";

export class SvgTreeParser {
  parse(document: InputDocument): TreeNode[] {
    return this.parseData(document.parsedData as HTMLElement);
  }

  parseData(element: HTMLElement) {
    if (!element) {
      return;
    }

    const root = new TreeNode();
    this.addChildNodes(root, root, element);
    return [root];
  }

  addChildNodes(root: TreeNode, parent: TreeNode, element: HTMLElement) {
    if (!element) {
      return root;
    }
    const converted = element as HTMLElement;
    if (!converted) {
      return;
    }

    element.childNodes.forEach(childElement => {
      const el = childElement as HTMLElement;
      if (!el) {
        return;
      }

      const currentNode = new TreeNode();
      if (!parent.children) {
        parent.children = [];
      }

      parent.children.push(currentNode);
      this.addChildNodes(root, currentNode, el);
    });
  }
}
