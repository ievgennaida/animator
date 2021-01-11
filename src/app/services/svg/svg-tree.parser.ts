import { InputDocument } from "src/app/models/input-document";
import { IParser } from "src/app/models/interfaces/parser";
import { DNumberProperty } from "src/app/models/Properties/DNumberProperty";
import { NumberProperty } from "src/app/models/Properties/NumberProperty";
import { Property } from "src/app/models/Properties/Property";
import { PropertyType } from "src/app/models/Properties/PropertyType";
import { TextProperty } from "src/app/models/Properties/TextProperty";
import { TreeNode } from "../../models/tree-node";
import { SVGElementType } from "./svg-element-type";

export class SvgTreeParser implements IParser {
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
    const node = new TreeNode();

    // custom label attribute:
    node.name = el.getAttribute("label") || el.id || `[${el.nodeName}]`;
    node.tag = el;
    const tagName = el.tagName.toLowerCase();
    node.nodeName = el.nodeName;
    node.type = tagName;

    if (tagName === SVGElementType.circle) {
      node.properties.items = this.getCircleProperties(node);
      node.icon = "fiber_manual_record";
    } else if (tagName === SVGElementType.ellipse) {
      node.properties.items = this.getEllipseProperties(node);
      node.icon = "fiber_manual_record";
    } else if (tagName === SVGElementType.rect) {
      node.properties.items = this.getRectProperties(node);
      node.icon = "crop_square";
    } else if (tagName === SVGElementType.svg) {
      node.icon = "folder_special";
    } else if (tagName === SVGElementType.path) {
      node.properties.items = this.getPathProperties(node);
      node.icon = "timeline";
    } else if (tagName === SVGElementType.polygon) {
      node.properties.items = this.getPolygonProperties(node);
      node.icon = "star_border";
    } else if (tagName === SVGElementType.polyline) {
      node.properties.items = this.getPolylineProperties(node);
      node.icon = "star_border";
    } else if (tagName === SVGElementType.tspan) {
      node.icon = "text_fields";
      node.allowRotate = false;
      node.allowResize = false;
      node.properties.items = this.getTSpanProperties(node);
    } else if (tagName === SVGElementType.text) {
      node.icon = "text_fields";
      node.properties.items = this.getTSpanProperties(node);
    } else if (tagName === SVGElementType.textpath) {
      node.icon = "text_fields";
    } else if (tagName === SVGElementType.line) {
      node.properties.items = this.getLineProperties(node);
    }
    return node;
  }
  getTransformProperty(node: TreeNode): TextProperty {
    const el = node.getElement();
    const text = new TextProperty(
      node,
      "transform",
      "transform",
      el,
      "transform"
    );
    text.readonly = true;
    return text;
  }

  getTSpanProperties(node: TreeNode): Property[] {
    const properties: Property[] = [];
    const el = node.getElement();
    const idProperty = new TextProperty(node, "id", "id", el, "id");
    idProperty.readonly = true;
    properties.push(idProperty);
    let dynamic = new DNumberProperty(
      node,
      // Default value: none; Animatable: yes
      new NumberProperty(
        node,
        "x",
        "x",
        el,
        "The x coordinate of the starting point of the text baseline."
      ),
      new NumberProperty(
        node,
        "y",
        "y",
        el,
        "The y coordinate of the starting point of the text baseline."
      )
    );
    dynamic.prop1.min = 0;
    dynamic.prop1.readonly = true;
    dynamic.prop2.min = 0;
    dynamic.prop2.readonly = true;
    properties.push(dynamic);
    dynamic = new DNumberProperty(
      node,
      // Value type: <length>|<percentage> ; Default value: none; Animatable: yes
      new NumberProperty(node, "dx", "dx", el, ""),
      // Default value: none; Animatable: yes
      new NumberProperty(
        node,
        "dy",
        "dy",
        el,
        "Shifts the text position vertically from a previous text element."
      )
    );
    dynamic.prop1.min = 0;
    dynamic.prop1.readonly = true;
    dynamic.prop2.min = 0;
    dynamic.prop2.readonly = true;
    properties.push(dynamic);

    dynamic = new DNumberProperty(
      node,
      new NumberProperty(node, "rx", "rx", el, "rx"),
      new NumberProperty(node, "ry", "ry", el, "ry")
    );
    dynamic.prop1.min = 0;
    dynamic.prop1.readonly = true;
    dynamic.prop2.min = 0;
    dynamic.prop2.readonly = true;
    properties.push(dynamic);
    // Value type: <list-of-number> ; Default value: none; Animatable: yes
    let textProperty = new TextProperty(
      node,
      "rotate",
      "r",
      el,
      "Rotates orientation of each individual glyph. Can rotate glyphs individually."
    );
    textProperty.readonly = true;

    properties.push(textProperty);

    // Value type: spacing|spacingAndGlyphs; Default value: spacing; Animatable: yes
    textProperty = new TextProperty(
      node,
      "lengthAdjust",
      "lengthAdjust",
      el,
      "How the text is stretched or compressed to fit the width defined by the textLength attribute."
    );
    textProperty.readonly = true;

    properties.push(textProperty);

    //Value type: <length>|<percentage> ; Default value: none; Animatable: yes
    const numberProperty = new NumberProperty(
      node,
      "textLength",
      "textLength",
      el,
      "A width that the text should be scaled to fit."
    );
    numberProperty.min = 0;
    numberProperty.readonly = true;

    properties.push(numberProperty);

    properties.push(this.getTransformProperty(node));
    return properties;
  }

  getIdProperty(node: TreeNode): TextProperty {
    const el = node.getElement();
    const text = new TextProperty(node, "id", "id", el, "id");
    text.readonly = true;
    return text;
  }
  getPolylineProperties(node: TreeNode): Property[] {
    const properties: Property[] = [];
    properties.push(this.getIdProperty(node));
    const text = new TextProperty(
      node,
      "points",
      "points",
      node.getElement(),
      "points"
    );
    text.readonly = true;
    properties.push(text);
    properties.push(this.getTransformProperty(node));
    return properties;
  }

  getPolygonProperties(node: TreeNode): Property[] {
    const properties: Property[] = [];
    properties.push(this.getIdProperty(node));
    const text = new TextProperty(
      node,
      "points",
      "points",
      node.getElement(),
      "points"
    );
    text.readonly = true;
    properties.push(text);
    properties.push(this.getTransformProperty(node));
    return properties;
  }
  getPathProperties(node: TreeNode): Property[] {
    const properties: Property[] = [];
    const el = node.getElement();
    properties.push(this.getIdProperty(node));

    const text = new TextProperty(node, "d", "d", el, "d");
    text.type = PropertyType.pathData;
    text.readonly = true;
    properties.push(text);

    properties.push(this.getTransformProperty(node));
    return properties;
  }

  getLineProperties(node: TreeNode): Property[] {
    const properties: Property[] = [];
    const el = node.getElement();
    properties.push(this.getIdProperty(node));
    let dynamic = new DNumberProperty(
      node,
      new NumberProperty(node, "x1", "x1", el, "x1"),
      new NumberProperty(node, "y1", "y1", el, "y1")
    );

    dynamic.prop1.min = 0;
    dynamic.prop1.readonly = true;
    dynamic.prop2.min = 0;
    dynamic.prop2.readonly = true;
    properties.push(dynamic);
    dynamic = new DNumberProperty(
      node,
      new NumberProperty(node, "x2", "x2", el, "x2"),
      new NumberProperty(node, "y2", "y2", el, "y2")
    );

    dynamic.prop1.min = 0;
    dynamic.prop1.readonly = true;
    dynamic.prop2.min = 0;
    dynamic.prop2.readonly = true;
    properties.push(dynamic);

    properties.push(this.getTransformProperty(node));
    return properties;
  }

  getEllipseProperties(node: TreeNode): Property[] {
    const properties: Property[] = [];
    const el = node.getElement();
    const idProperty = new TextProperty(node, "id", "id", el, "id");
    idProperty.readonly = true;
    properties.push(idProperty);
    let dynamic = new DNumberProperty(
      node,
      new NumberProperty(node, "cx", "cx", el, "cx"),
      new NumberProperty(node, "cy", "cy", el, "cy")
    );

    dynamic.prop1.min = 0;
    dynamic.prop1.readonly = true;
    dynamic.prop2.min = 0;
    dynamic.prop2.readonly = true;
    properties.push(dynamic);
    dynamic = new DNumberProperty(
      node,
      new NumberProperty(node, "rx", "rx", el, "rx"),
      new NumberProperty(node, "ry", "ry", el, "ry")
    );

    dynamic.prop1.min = 0;
    dynamic.prop1.readonly = true;
    dynamic.prop2.min = 0;
    dynamic.prop2.readonly = true;
    properties.push(dynamic);

    properties.push(this.getTransformProperty(node));
    return properties;
  }

  getCircleProperties(node: TreeNode): Property[] {
    const properties: Property[] = [];
    const el = node.getElement();
    const idProperty = new TextProperty(node, "id", "id", el, "id");
    idProperty.readonly = true;
    properties.push(idProperty);
    const dynamic = new DNumberProperty(
      node,
      new NumberProperty(node, "cx", "cx", el, "cx"),
      new NumberProperty(node, "cy", "cy", el, "cy")
    );
    dynamic.prop1.min = 0;
    dynamic.prop1.readonly = true;
    dynamic.prop2.min = 0;
    dynamic.prop2.readonly = true;
    properties.push(dynamic);
    const numberProperty = new NumberProperty(node, "r", "r", el, "r");
    numberProperty.min = 0;
    numberProperty.readonly = true;

    properties.push(numberProperty);

    properties.push(this.getTransformProperty(node));
    return properties;
  }

  getRectProperties(node: TreeNode): Property[] {
    const properties: Property[] = [];
    const el = node.getElement();
    const idProperty = new TextProperty(node, "id", "id", el, "id");
    idProperty.readonly = true;
    properties.push(idProperty);
    let dynamic = new DNumberProperty(
      node,
      new NumberProperty(node, "x", "x", el, "x"),
      new NumberProperty(node, "y", "y", el, "y")
    );
    dynamic.prop1.min = 0;
    dynamic.prop1.readonly = true;
    dynamic.prop2.min = 0;
    dynamic.prop2.readonly = true;
    properties.push(dynamic);
    dynamic = new DNumberProperty(
      node,
      new NumberProperty(node, "width", "Width", el, "Width"),
      new NumberProperty(node, "height", "Height", el, "Height")
    );
    dynamic.prop1.min = 0;
    dynamic.prop1.readonly = true;
    dynamic.prop2.min = 0;
    dynamic.prop2.readonly = true;
    properties.push(dynamic);

    dynamic = new DNumberProperty(
      node,
      new NumberProperty(node, "rx", "rx", el, "rx"),
      new NumberProperty(node, "ry", "ry", el, "ry")
    );
    dynamic.prop1.min = 0;
    dynamic.prop1.readonly = true;
    dynamic.prop2.min = 0;
    dynamic.prop2.readonly = true;
    properties.push(dynamic);

    properties.push(this.getTransformProperty(node));
    return properties;
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
