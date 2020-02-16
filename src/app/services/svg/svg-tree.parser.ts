import { Injectable } from "@angular/core";
import { TreeNode } from "../../models/tree-node";
import { InputDocument } from "src/app/models/input-document";

export class SvgTreeParser {
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
    "use"
  ];

  parse(document: InputDocument): TreeNode[] {
    const element = document.parsedData as HTMLElement;
    if (!element) {
      return;
    }

    const root = new TreeNode();
    root.tag = document;
    root.name = document.title;
    const collection = [root];
    this.addChildNodes(root, collection, element);
    return collection;
  }

  addChildNodes(parent: TreeNode, collection, element: HTMLElement) {
    if (!element) {
      return;
    }

    const converted = element as HTMLElement;
    if (!converted) {
      return;
    }

    element.childNodes.forEach(childElement => {
      if (childElement.nodeType !== 1) {
        return;
      }

      const el = childElement as HTMLElement;
      if (!el || !this.allowed.includes(el.nodeName)) {
        return;
      }

      const currentNode = new TreeNode();
      currentNode.name = el.nodeName;
      currentNode.tag = el;
      this.addChildNodes(parent, currentNode.children, el);
      collection.push(currentNode);
    });
  }
}
