import { Injectable } from "@angular/core";
import { TreeNode } from "../../models/tree-node";
import { NodeType } from "../../models/Lottie/NodeType";
import { Property } from "../../models/Properties/Property";
import { NumberProperty } from "../../models/Properties/NumberProperty";
import { TextProperty } from "../../models/Properties/TextProperty";
import { BoolProperty } from "../../models/Properties/BoolProperty";
import { ComboProperty } from "../../models/Properties/ComboProperty";
import { blendMode } from "../../models/Lottie/helpers/blendMode";
import { transform } from "../../models/Lottie/helpers/transform";
import { layerType } from "../../models/Lottie/layers/layerType";
import { ColorProperty } from "../../models/Properties/ColorProperty";
import { Properties } from "../../models/Properties/Properties";
import { PropertyType } from "../../models/Properties/PropertyType";
import { Subject, Observable } from "rxjs";
import { shapeType } from "../../models/Lottie/shapes/shapeType";
import {
  composite,
  defaultComposite
} from "../../models/Lottie/helpers/composite";
import {
  defaultGradientType,
  gradientType
} from "../../models/Lottie/helpers/gradientType";
import { lineJoint, defaultLineJoint } from "../../models/Lottie/helpers/lineJoin";
import { defaultLineCap, lineCap } from "../../models/Lottie/helpers/lineCap";
import { multiDimensional } from "../../models/Lottie/properties/multiDimensional";
import { PropertyDataType } from "../../models/Properties/PropertyDataType";
import { Keyframe } from "../../models/keyframes/Keyframe";
import { DNumberProperty } from '../../models/Properties/DNumberProperty';

export class LottiePropertiesParser {
  constructor() {}

  getProperties(node: TreeNode): Properties {
    const property = new Properties();
    const properties = (property.items = []);

    // App properties
    if (node.type === NodeType.File) {
      const nameProperty = new TextProperty(
        node,
        "nm",
        "Name",
        node.data,
        "Composition name"
      );
      properties.push(nameProperty);
      node.nameProperty = nameProperty;
      const version = new TextProperty(node, "v", "Version", node.data, "Version");
      version.readonly = true;
      properties.push(version);

      let prop = new NumberProperty(
        node,
        "ip",
        "In Point",
        node.data,
        "In Point of the Time Ruler. Sets the initial Frame of the animation."
      );

      let keyframe = new Keyframe();
      keyframe.model = node.model;
      keyframe.property = prop;
      prop.keyframes.push(keyframe);
      prop.min = 0;
      properties.push(prop);

      prop = new NumberProperty(
        node,
        "op",
        "Out Point",
        node.data,
        "Out of the Time Ruler. Sets the final Frame of the animation"
      );

      keyframe = new Keyframe();
      keyframe.model = node.model;
      keyframe.property = prop;
      prop.keyframes.push(keyframe);

      prop.min = 0;
      properties.push(prop);

      prop = new NumberProperty(
        node,
        "fr",
        "Frame Rate",
        node.data,
        "Frame Rate. 30 and 60 are recomended"
      );
      prop.min = 0;
      properties.push(prop);

      prop = new NumberProperty(
        node,
        "h",
        "Height",
        node.data,
        "Composition Height"
      );
      prop.min = 0;
      properties.push(prop);

      prop = new NumberProperty(
        node,
        "w",
        "Width",
        node.data,
        "Composition Width"
      );
      prop.min = 0;
      properties.push(prop);
      //  properties.push(new NumberProperty('ddd','Width', node.data, 'Composition Width'));
    } else if (node.type === NodeType.Layer) {
      let childProperties = this.getLayerProperties(node);
      childProperties.forEach(p => properties.push(p));

      // Transform. Transform properties
      const data = node.data["ks"] || ({} as transform);
      childProperties = this.getTransfromProperties(node, data);
      childProperties.forEach(p => properties.push(p));
    } else if (node.type === NodeType.Shape) {
      const childProperties = this.getShapeProperties(node);
      childProperties.forEach(p => properties.push(p));
    }

    return property;
  }

  getShapeProperties(node: TreeNode): Property[] {
    const properties: Property[] = [];
    const nameProperty = new TextProperty(node, "nm", "Name", node.data, "Shape name");
    properties.push(nameProperty);
    node.nameProperty = nameProperty;

    const type: shapeType = node.data.ty;
    if (type === shapeType.trim) {
      let prop = new NumberProperty(
        node,
        "s",
        "Trim Start.",
        node.data,
        ""
      );

      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "first_page";
      properties.push(prop);

      prop = new NumberProperty(node, "e", "Trim End", node.data, "");
      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "last_page";
      properties.push(prop);

      prop = new NumberProperty(
        node,
        "o",
        "Offset",
        node.data,
        "Trim Offset"
      );
      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "short_text";
      properties.push(prop);
    } else if (type === shapeType.transform) {
      // Transform. Transform properties
      const childProperties = this.getTransfromProperties(node, node.data);
      childProperties.forEach(p => properties.push(p));
    } else if (type === shapeType.stroke) {
      let prop = new NumberProperty(
        node,
        "ml",
        "Miter Limit",
        node.data,
        "Only if Line Join is set to Miter."
      );

      prop.icon = "";
      properties.push(prop);

      properties.push(
        new ComboProperty(
          node,
          "lg",
          "Line Join",
          Object.values(lineJoint),
          defaultLineJoint,
          node.data,
          ""
        )
      );

      properties.push(
        new ComboProperty(
          node,
          "lc",
          "Line Cap",
          Object.values(lineCap),
          defaultLineCap,
          node.data,
          ""
        )
      );

      prop = new NumberProperty(
        node,
        "o",
        "Opacity",
        node.data,
        "Stroke Opacity"
      );
      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.min = 0;
      prop.max = 100;
      prop.icon = "opacity";
      properties.push(prop);

      prop = new NumberProperty(node, "w", "Stroke Width", node.data, "");
      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "border_style";
      properties.push(prop);

      const color = new ColorProperty(node, "c", "Color", node.data, "Stroke Color");

      color.dataType = PropertyDataType.multi;
      color.renderAsOutline = true;
      color.icon = "color_lens";
      properties.push(color);
    } else if (type === shapeType.star) {
      const directionProperty = new BoolProperty(node,
        "d",
        "Direction",
        node.data,
        "Direction how the shape is drawn"
      );

      directionProperty.icon = "swap_horiz";
      properties.push(directionProperty);

      let prop = new NumberProperty(
        node,
        "ir",
        "Inner Radius",
        node.data,
        "Star's inner radius"
      );

      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty(
        node,
        "is",
        "Inner Roundness",
        node.data,
        "Star's inner roundness"
      );

      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty(
        node,
        "or",
        "Outer Radius",
        node.data,
        "Star's outer radius"
      );

      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty(
        node,
        "os",
        "Outer Roundness",
        node.data,
        "Star's outer roundness"
      );

      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty(
        node,
        "r",
        "Rotation",
        node.data,
        "Star's rotation."
      );

      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty(
        node,
        "pt",
        "Points",
        node.data,
        "Star's number of points."
      );

      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      // TODO: check?
      prop = new NumberProperty(
        node,
        "sy",
        "Star Type",
        node.data,
        "Star's type. Polygon or Star."
      );
      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      const pos = new DNumberProperty(
        node,
        "p",
        "Position",
        node.data,
        "Star's position",
        null // TODO: get property from lottie engine
      );

      pos.dataType = PropertyDataType.multi;
      pos.renderAsOutline = true;
      properties.push(pos);
    } else if (type === shapeType.round) {
      const prop = new NumberProperty(
        node,
        "r",
        "Radius",
        node.data,
        "Rounded Corner Radius"
      );

      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "rounded_corner";
      properties.push(prop);
    } else if (type === shapeType.repeater) {
      properties.push(
        new ComboProperty(
          node,
          "m",
          "Mode",
          Object.values(composite),
          defaultComposite,
          node.data,
          "Composite of copies"
        )
      );

      const data = node.data['tr'] || ({} as transform);
      // Transform Transform values for each repeater copy
      const childProperties = this.getTransfromProperties(node, data);
      childProperties.forEach(p => properties.push(p));

      let prop = new NumberProperty(
        node,
        "c",
        "Copies",
        node.data,
        "Number of Copies"
      );

      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "format_list_numbered";
      properties.push(prop);
      // {"a": 0, "k": 0}
      prop = new NumberProperty(
        node,
        "o",
        "Offset",
        node.data,
        "Offset of Copies default"
      );

      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "settings_ethernet";
      properties.push(prop);
    } else if (type === shapeType.rect) {
      const directionProperty = new BoolProperty(
        node,
        "d",
        "Direction",
        node.data,
        "Direction how the shape is drawn"
      );

      directionProperty.icon = "swap_horiz";
      properties.push(directionProperty);

      const prop = new NumberProperty(
        node,
        "r",
        "Rounded corners",
        node.data,
        "Rect's rounded corners"
      );
      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "rounded_corner";
      properties.push(prop);

      const pos = new DNumberProperty(
        node,
        "p",
        "Position",
        node.data,
        "Rect's position",
        null, // TODO: get property from lottie engine
      );

      pos.dataType = PropertyDataType.multi;
      pos.renderAsOutline = true;
      properties.push(pos);

      const size = new DNumberProperty(
        node,
        "s",
        "Size",
        node.data,
        "Rect's Size",
        null, // TODO: get property from lottie engine
      );

      size.dataType = PropertyDataType.multi;
      size.renderAsOutline = true;
      properties.push(size);
    } else if (type === shapeType.merge) {
      const prop = new TextProperty(node, "mm", "OffMerge Modeset", node.data, "");

      prop.icon = "call_merge";
      properties.push(prop);
    } else if (type === shapeType.gStroke) {
      /**
       * Gradient Colors
       */
      // g: any;

      let prop = new NumberProperty(
        node,
        "ml",
        "Miter Limit",
        node.data,
        "Gradient Stroke Miter Limit. Only if Line Join is set to Miter."
      );

      prop.icon = "";
      properties.push(prop);

      properties.push(
        new ComboProperty(
          node,
          "t",
          "Gradient Type",
          Object.values(gradientType),
          defaultGradientType,
          node.data,
          ""
        )
      );

      properties.push(
        new ComboProperty(
          node,
          "lg",
          "Line Join",
          Object.values(lineJoint),
          defaultLineJoint,
          node.data,
          ""
        )
      );

      prop = new NumberProperty(
        node,
        "w",
        "Stroke Width",
        node.data,
        "Gradient Stroke Width"
      );
      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "border_style";
      properties.push(prop);

      prop = new NumberProperty(
        node,
        "h",
        "Highlight Length",
        node.data,
        "Gradient Highlight Length. Only if type is Radial"
      );
      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty(
        node,
        "a",
        "Highlight Angle",
        node.data,
        "Highlight Angle. Only if type is Radial"
      );

      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty(
        node,
        "o",
        "Opacity",
        node.data,
        "Stroke Opacity"
      );
      prop.min = 0;
      prop.max = 100;
      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "opacity";
      properties.push(prop);

      properties.push(
        new ComboProperty(
          node,
          "lc",
          "Line Cap",
          Object.values(lineCap),
          defaultLineCap,
          node.data,
          ""
        )
      );

      const startProp = new DNumberProperty(
        node,
        "s",
        "Start Point",
        transform,
        "Gradient Start Point",
        null, // TODO: get property from lottie engine
      );

      startProp.dataType = PropertyDataType.multi;
      startProp.renderAsOutline = true;
      properties.push(startProp);

      const endProp = new NumberProperty(
        node,
        "e",
        "End Point",
        transform,
        "Gradient End Point"
      );

      endProp.dataType = PropertyDataType.multi;
      endProp.renderAsOutline = true;
      properties.push(endProp);
    } else if (type === shapeType.group) {
      const prop = new NumberProperty(
        node,
        "np",
        "Gr. num",
        node.data,
        "Used for expressions"
      );
      prop.readonly = true;
      properties.push(prop);

      /**
       * Items. Group list of items
       */
      // it?: anyShape[];
    } else if (type === shapeType.gFill) {
      /**
       * Gradient Colors
       */
      // g: any;

      properties.push(
        new ComboProperty(
          node,
          "t",
          "Gradient Type",
          Object.values(gradientType),
          defaultGradientType,
          node.data,
          ""
        )
      );

      let prop = new NumberProperty(
        node,
        "h",
        "Highlight Length",
        node.data,
        "Gradient Highlight Length. Only if type is Radial"
      );

      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);
      prop = new NumberProperty(
        node,
        "a",
        "Highlight Angle",
        node.data,
        "Highlight Angle. Only if type is Radial"
      );
      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty(
        node,
        "o",
        "Opacity",
        node.data,
        "Stroke Opacity"
      );
      prop.min = 0;
      prop.max = 100;
      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "opacity";
      properties.push(prop);

      const startProp = new DNumberProperty(
        node,
        "s",
        "Start Point",
        node.data,
        "Gradient Start Point",
        null, // TODO: get property from lottie engine
      );

      startProp.dataType = PropertyDataType.multi;
      startProp.renderAsOutline = true;
      properties.push(startProp);

      const endProp = new DNumberProperty(
        node,
        "e",
        "End Point",
        node.data,
        "Gradient End Point",
        null, // TODO: get property from lottie engine
      );

      endProp.dataType = PropertyDataType.multi;
      endProp.renderAsOutline = true;
      properties.push(endProp);
    } else if (type === shapeType.fill) {
      const prop = new NumberProperty(
        node,
        "o",
        "Opacity",
        node.data,
        "Fill Opacity"
      );
      prop.min = 0;
      prop.max = 100;
      prop.dataType = PropertyDataType.value;
      prop.renderAsOutline = true;
      prop.icon = "opacity";
      properties.push(prop);

      const color = new ColorProperty(node,
        "c", "Color", node.data, "Fill Color");

      color.dataType = PropertyDataType.multi;
      color.renderAsOutline = true;
      color.icon = "color_lens";
      properties.push(color);
    } else if (type === shapeType.ellipse) {
      const directionProperty = new BoolProperty(
        node,
        "d",
        "Direction",
        node.data,
        "Direction how the shape is drawn"
      );

      directionProperty.icon = "swap_horiz";
      properties.push(directionProperty);

      let prop = new NumberProperty(
        node,
        "p",
        "Position",
        node.data,
        "Ellipse's position"
      );

      prop.dataType = PropertyDataType.multi;
      prop.renderAsOutline = true;
      properties.push(prop);

      prop = new NumberProperty(
        node,
        "s",
        "Size",
        node.data,
        "Ellipse's size"
      );

      prop.dataType = PropertyDataType.multi;
      prop.renderAsOutline = true;
      properties.push(prop);
    } else if (type === shapeType.shape) {
      const directionProperty = new BoolProperty(
        node,
        "d",
        "Direction",
        node.data,
        "Direction how the shape is drawn"
      );

      directionProperty.icon = "swap_horiz";
      properties.push(directionProperty);

      // shapeProp | shapeKeyframed
      // TODO: text editor
      const prop = new NumberProperty(
        node,
        "ks",
        "Vertices",
        node.data,
        "Shape's vertices"
      );

      prop.icon = "show_chart";
      prop.dataType = PropertyDataType.multi;
      prop.renderAsOutline = true;
      properties.push(prop);
    }
    return properties;
  }

  getLayerProperties(node: TreeNode): Property[] {
    const properties: Property[] = [];

    const nameProperty = new TextProperty(node, "nm", "Name", node.data, "Layer name");
    properties.push(nameProperty);
    node.nameProperty = nameProperty;
    properties.push(
      new BoolProperty(
        node,
        "ao",
        "Auto-Orient",
        node.data,
        "Auto-Orient along path AE property"
      )
    );

    let prop = new NumberProperty(
      node,
      "ip",
      "In Point",
      node.data,
      "In Point of the Time Ruler. Sets the initial Frame of the animation."
    );
    prop.min = 0;
    let keyframe = new Keyframe();
    keyframe.model = node.model;
    keyframe.property = prop;
    prop.keyframes.push(keyframe);

    properties.push(prop);
    prop = new NumberProperty(
      node,
      "op",
      "Out Point",
      node.data,
      "Out of the Time Ruler. Sets the final Frame of the animation"
    );

    prop.min = 0;
    keyframe = new Keyframe();
    keyframe.model = node.model;
    keyframe.property = prop;
    prop.keyframes.push(keyframe);

    properties.push(prop);

    properties.push(
      new BoolProperty(
        node,
        "sr",
        "Time Stretching",
        node.data,
        "Layer Time Stretching"
      )
    );
    properties.push(
      new BoolProperty(
        node,
        "st",
        "Start Time of layer",
        node.data,
        "Sets the start time of the layer"
      )
    );
    properties.push(
      new ComboProperty(
        node,
        "bm",
        "Blend Mode",
        Object.values(blendMode),
        blendMode.normal,
        node.data,
        ""
      )
    );

    properties.push(new BoolProperty(node, "hasMask", "Has Mask", node.data, ""));

    if (node.data.type === layerType.Solid) {
      const color = new ColorProperty(node, "sc", "Solid Color", node.data, "");
      color.icon = "color_lens";
      // Single
      properties.push(color);

      prop = new NumberProperty(
        node,
        "sh",
        "Solid Height",
        node.data,
        ""
      );
      prop.min = 0;
      properties.push(prop);

      prop = new NumberProperty(node, "sw", "Solid Width", node.data, "");
      prop.min = 0;
      properties.push(prop);
    }

    return properties;
  }

  getTransfromProperties(node: TreeNode, data: any): Property[] {
    const properties: Property[] = [];
    let dynamicProperty = null;
    if (node.tag) {
      dynamicProperty = node.tag.dynamicProperties.find(
        element => element.data === data
      );
    }

    let prop = new NumberProperty(
      node,
      "r",
      "Rotation",
      data,
      "Transform Rotation"
    );

    prop.dataType = PropertyDataType.value;
    prop.renderAsOutline = true;
    prop.icon = "autorenew";
    prop.dynamicProperty = dynamicProperty;
    properties.push(prop);

    // {"a":0, "k":100}
    prop = new NumberProperty(
      node,
      "o",
      "Opacity",
      data,
      "Transform Opacity"
    );
    prop.min = 0;
    prop.max = 100;
    prop.icon = "opacity";
    prop.dataType = PropertyDataType.value;
    prop.renderAsOutline = true;
    prop.dynamicProperty = dynamicProperty;
    properties.push(prop);

    /*
      prop = new NumberProperty("px", "X", transform, "Transform Position X");
      prop.type = PropertyType.value;
      properties.push(prop);

      prop = new NumberProperty("py", "Y", transform, "Transform Position Y");
      prop.type = PropertyType.value;
      properties.push(prop);

      prop = new NumberProperty("pz", "Z", transform, "Transform Position Z");
      prop.type = PropertyType.value;
      properties.push(prop);
    */

    prop = new NumberProperty(node, "sk", "Skew", data, "Transform Skew");
    prop.icon = "compare_arrows";
    prop.dataType = PropertyDataType.value;
    prop.dynamicProperty = dynamicProperty;
    prop.renderAsOutline = true;

    properties.push(prop);

    prop = new NumberProperty(
      node,
      "sa",
      "Skew Axis",
      transform,
      "Transform Skew Axis"
    );

    prop.icon = "subdirectory_arrow_right";
    prop.dataType = PropertyDataType.value;
    prop.dynamicProperty = dynamicProperty;
    prop.renderAsOutline = true;
    properties.push(prop);

    // {"a":0, "k":[0, 0, 0]}
    const anchorProperty = new DNumberProperty(
      node,
      "a",
      "Anchor Point",
      transform,
      "Transform Anchor Point",
      dynamicProperty
    );

    anchorProperty.icon = "filter_center_focus";
    anchorProperty.dynamicProperty = dynamicProperty;
    anchorProperty.dataType = PropertyDataType.multi;
    anchorProperty.renderAsOutline = true;
    properties.push(anchorProperty);

    // {"a":0, "k":[0, 0, 0]}
    const pos = new DNumberProperty(
      node,
      "p",
      "Pos",
      data,
      "Transform Position",
      dynamicProperty
    );
    pos.dynamicProperty = dynamicProperty;
    pos.icon = "photo_size_select_small";
    pos.dataType = PropertyDataType.multi;
    pos.renderAsOutline = true;
    properties.push(pos);

    // {"a":0, "k":[100, 100, 100]}
    const scale = new DNumberProperty(
      node,
      "s",
      "Scale",
      data,
      "Transform Scale",
      dynamicProperty
    );

    scale.icon = "settings_overscan";
    scale.dataType = PropertyDataType.multi;
    scale.renderAsOutline = true;
    properties.push(scale);

    return properties;
  }
}
