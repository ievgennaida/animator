import { InputDocument } from "src/app/models/input-document";
import { IParser } from "src/app/models/interfaces/parser";
import { Flags, TreeNode } from "../../models/tree-node";
import { SVGElementType } from "./svg-element-type";
import { SvgProperties } from "./svg-properties";

export class SvgTreeParser implements IParser {
  constructor(private svgPropertiesProvider = new SvgProperties()) {}

  allowed: string[] = [
    SVGElementType.a,
    SVGElementType.circle, // cx, cy, r
    SVGElementType.ellipse, // cx, cy, rx, ry
    SVGElementType.foreignObject,
    SVGElementType.g, // g
    SVGElementType.image,
    SVGElementType.line, // ‘x1’, ‘y1’, ‘x2’, ‘y2’, stroke-width
    SVGElementType.mesh,
    SVGElementType.path,
    SVGElementType.polygon,
    SVGElementType.polyline,
    SVGElementType.rect, // https://www.w3.org/TR/2016/CR-SVG2-20160915/shapes.html#RectElement
    SVGElementType.svg, // can be used as a group
    SVGElementType.switch,

    SVGElementType.symbol,
    SVGElementType.text,
    SVGElementType.textpath,
    SVGElementType.tspan,
    SVGElementType.unknown,
    SVGElementType.use,
    // "defs" // The <defs> element is used to store content that will not be directly displayed.
  ];
  clone(node: TreeNode, deep = true): TreeNode {
    const clonedNode = node?.getElement()?.cloneNode(deep) as Element;
    const cloned = this.convertTreeNode(clonedNode, deep);
    return cloned;
  }
  parse(document: InputDocument): TreeNode[] {
    const element = document.parsedData as HTMLElement;
    if (!element) {
      return;
    }

    // Represent root node:
    const svgRootNode = this.convertTreeNode(element, true);
    svgRootNode.addFlag(Flags.disableRotate);
    svgRootNode.addFlag(Flags.disableRemove);
    svgRootNode.addFlag(Flags.disableTransform);
    svgRootNode.icon = "assignment";
    svgRootNode.name = document.title;
    svgRootNode.isRoot = true;
    svgRootNode.expanded = true;
    return [svgRootNode];
  }
  isContainer(node: TreeNode): boolean {
    if (!node) {
      return false;
    }
    if (
      node.type === SVGElementType.svg ||
      node.type === SVGElementType.g ||
      node.type === SVGElementType.symbol
    ) {
      return true;
    }
    return false;
  }

  /**
   * Convert element to treeNode.
   * @param el element to be converted.
   */
  convertTreeNode(elArgs: any, deep = true): TreeNode {
    const el = elArgs as HTMLElement;
    const node = new TreeNode();

    // custom label attribute:
    node.name = el.getAttribute("label") || el.id || `[${el.nodeName}]`;
    node.tag = el;
    const tagName = el.tagName.toLowerCase();
    node.nodeName = el.nodeName;
    node.type = tagName;

    if (tagName === SVGElementType.circle) {
      node.icon = "fiber_manual_record";
    } else if (tagName === SVGElementType.ellipse) {
      node.icon = "fiber_manual_record";
    } else if (tagName === SVGElementType.rect) {
      node.icon = "crop_square";
    } else if (tagName === SVGElementType.svg) {
      node.icon = "folder_special";
    } else if (tagName === SVGElementType.path) {
      node.icon = "timeline";
    } else if (tagName === SVGElementType.polygon) {
      node.icon = "star_border";
    } else if (tagName === SVGElementType.polyline) {
      node.icon = "star_border";
    } else if (tagName === SVGElementType.tspan) {
      node.icon = "text_fields";
      node.addFlag(Flags.disableRotate);
      node.addFlag(Flags.disableScale);
    } else if (tagName === SVGElementType.text) {
      node.icon = "text_fields";
    } else if (tagName === SVGElementType.textpath) {
      node.icon = "text_fields";
    }

    node.properties.items = this.svgPropertiesProvider.getProperties(node);
    if (deep) {
      this.addChildNodes(node, node.children, el);
    }
    return node;
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
      collection.push(currentNode);
    });
    return collection;
  }
}
