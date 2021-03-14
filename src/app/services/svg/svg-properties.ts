import { DNumberProperty } from "src/app/models/properties/dnumber-property";
import { NumberProperty } from "src/app/models/properties/number-property";
import { Property } from "src/app/models/properties/property";
import { PropertyType } from "src/app/models/properties/property-type";
import { TextProperty } from "src/app/models/properties/text-property";
import { TreeNode } from "../../models/tree-node";
import { SVGElementType } from "./svg-element-type";

export class SvgProperties {
  /**
   * get properties
   */
  getProperties(node: TreeNode): Property[] {
    const tagName = node.getElement().tagName.toLowerCase();

    if (tagName === SVGElementType.circle) {
      return this.getCircleProperties(node);
    } else if (tagName === SVGElementType.ellipse) {
      return this.getEllipseProperties(node);
    } else if (tagName === SVGElementType.rect) {
      return this.getRectProperties(node);
    } else if (tagName === SVGElementType.path) {
      return this.getPathProperties(node);
    } else if (tagName === SVGElementType.polygon) {
      return this.getPolygonProperties(node);
    } else if (tagName === SVGElementType.polyline) {
      return this.getPolylineProperties(node);
    } else if (tagName === SVGElementType.tspan) {
      return this.getTSpanProperties(node);
    } else if (tagName === SVGElementType.text) {
      return this.getTSpanProperties(node);
    } else if (tagName === SVGElementType.line) {
      return this.getLineProperties(node);
    }
    return [];
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

    // Value type: <length>|<percentage> ; Default value: none; Animatable: yes
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
}
