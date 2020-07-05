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
    "use",
  ];

  parse(document: InputDocument): TreeNode[] {
    const element = document.parsedData as HTMLElement;
    if (!element) {
      return;
    }

    const root = new TreeNode();
    root.tag = document;
    root.name = document.title;
    root.transformable = false;
    root.icon = "assignment";
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

    element.childNodes.forEach((childElement) => {
      if (childElement.nodeType !== 1) {
        return;
      }

      const el = childElement as HTMLElement;
      if (!el || !this.allowed.includes(el.nodeName)) {
        return;
      }

      const currentNode = new TreeNode();
      currentNode.parent = parent;
      // custom label attribute:
      currentNode.name =
        el.getAttribute("label") || el.id || `[${el.nodeName}]`;
      currentNode.tag = el;
      const tagName = el.tagName.toLowerCase();

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

      this.addChildNodes(currentNode, currentNode.children, el);
      collection.push(currentNode);
    });
  }
}
