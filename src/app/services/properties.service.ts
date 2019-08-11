import { Injectable } from "@angular/core";
import { Node } from "../models/Node";
import { NodeType } from "../models/NodeType";
import { Property } from "../models/Properties/Property";
import { NumberProperty } from "../models/Properties/NumberProperty";
import { TextProperty } from "../models/Properties/TextProperty";
import { BoolProperty } from "../models/Properties/BoolProperty";
import { ComboProperty } from "../models/Properties/ComboProperty";
import { blendMode } from "../models/Lottie/helpers/blendMode";
import { transform } from "../models/Lottie/helpers/transform";
import { layerType } from "../models/Lottie/layers/layerType";
import { ColorProperty } from "../models/Properties/ColorProperty";
import { Properties } from "../models/Properties/Properties";
import { PropertyType } from "../models/Properties/PropertyType";
import { Subject, Observable } from "rxjs";
import { shapeType } from "../models/Lottie/shapes/shapeType";
import {
  composite,
  defaultComposite
} from "../models/Lottie/helpers/composite";
import {
  defaultGradientType,
  gradientType
} from "../models/Lottie/helpers/gradientType";
import { lineJoint, defaultLineJoint } from "../models/Lottie/helpers/lineJoin";
import { defaultLineCap, lineCap } from "../models/Lottie/helpers/lineCap";
import { multiDimensional } from "../models/Lottie/properties/multiDimensional";

@Injectable({
  providedIn: "root"
})
export class PropertiesService {
  constructor() {}
  changedSubject = new Subject<Property>();
  public get сhanged(): Observable<any> {
    return this.changedSubject.asObservable();
  }

  public emitPropertyChanged(propery: Property) {
    this.changedSubject.next(propery);
  }

  getProperties(node: Node): Properties {
    let property = new Properties();
    const properties = (property.items = []);

    // App properties
    if (node.type == NodeType.File) {
      let nameProperty = new TextProperty(
        "nm",
        "Name",
        node.data,
        "Composition name"
      );
      properties.push(nameProperty);
      node.nameProperty = nameProperty;
      const version = new TextProperty("v", "Version", node.data, "Version");
      version.readonly = true;
      properties.push(version);

      let prop = new NumberProperty(
        "ip",
        "In Point",
        node.data,
        "In Point of the Time Ruler. Sets the initial Frame of the animation."
      );
      prop.keyframe = true;
      prop.min = 0;
      properties.push(prop);

      prop = new NumberProperty(
        "op",
        "Out Point",
        node.data,
        "Out of the Time Ruler. Sets the final Frame of the animation"
      );
      prop.keyframe = true;
      prop.min = 0;
      properties.push(prop);

      prop = new NumberProperty(
        "fr",
        "Frame Rate",
        node.data,
        "Frame Rate. 30 and 60 are recomended"
      );
      prop.min = 0;
      properties.push(prop);

      prop = new NumberProperty("h", "Height", node.data, "Composition Height");
      prop.min = 0;
      properties.push(prop);

      prop = new NumberProperty("w", "Width", node.data, "Composition Width");
      prop.min = 0;
      properties.push(prop);
      //  properties.push(new NumberProperty('ddd','Width', node.data, 'Composition Width'));
    } else if (node.type == NodeType.Layer) {
      let childProperties = this.getLayerProperties(node);
      childProperties.forEach(p => properties.push(p));

      // Transform. Transform properties
      let data = node.data["ks"] || ({} as transform);
      childProperties = this.getTransfromProperties(node, data);
      childProperties.forEach(p => properties.push(p));
    } else if (node.type == NodeType.Shape) {
      let childProperties = this.getShapeProperties(node);
      childProperties.forEach(p => properties.push(p));
    }

    return property;
  }

  getShapeProperties(node: Node): Property[] {
    let properties: Property[] = [];
    let nameProperty = new TextProperty("nm", "Name", node.data, "Shape name");
    properties.push(nameProperty);
    node.nameProperty = nameProperty;

    const type: shapeType = node.data.ty;
    if (type == shapeType.trim) {
      let prop = new NumberProperty("s", "Trim Start.", node.data, "");

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "first_page";
      properties.push(prop);

      prop = new NumberProperty("e", "Trim End", node.data, "");

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "last_page";
      properties.push(prop);

      prop = new NumberProperty("o", "Offset", node.data, "Trim Offset");

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "short_text";
      properties.push(prop);
    } else if (type == shapeType.transform) {
      // Transform. Transform properties
      const childProperties = this.getTransfromProperties(node, node.data);
      childProperties.forEach(p => properties.push(p));
    } else if (type == shapeType.stroke) {
      let prop = new NumberProperty(
        "ml",
        "Miter Limit",
        node.data,
        "Only if Line Join is set to Miter."
      );

      prop.icon = "";
      properties.push(prop);

      properties.push(
        new ComboProperty(
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
          "lc",
          "Line Cap",
          Object.values(lineCap),
          defaultLineCap,
          node.data,
          ""
        )
      );

      prop = new NumberProperty("o", "Opacity", node.data, "Stroke Opacity");

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "opacity";
      properties.push(prop);

      prop = new NumberProperty("w", "Stroke Width", node.data, "");

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "border_style";
      properties.push(prop);

      let color = new ColorProperty("c", "Color", node.data, "Stroke Color");

      color.type = PropertyType.multi;
      color.renderAsOutline = true;
      color.keyframe = true;
      color.icon = "color_lens";
      properties.push(color);
    } else if (type == shapeType.star) {
      const directionProperty = new BoolProperty(
        "d",
        "Direction",
        node.data,
        "Direction how the shape is drawn"
      );

      directionProperty.icon = "swap_horiz";
      properties.push(directionProperty);

      let prop = new NumberProperty(
        "ir",
        "Inner Radius",
        node.data,
        "Star's inner radius"
      );

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty(
        "is",
        "Inner Roundness",
        node.data,
        "Star's inner roundness"
      );

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty(
        "or",
        "Outer Radius",
        node.data,
        "Star's outer radius"
      );

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty(
        "os",
        "Outer Roundness",
        node.data,
        "Star's outer roundness"
      );

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty("r", "Rotation", node.data, "Star's rotation.");

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty(
        "pt",
        "Points",
        node.data,
        "Star's number of points."
      );

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      // TODO: check?
      prop = new NumberProperty(
        "sy",
        "Star Type",
        node.data,
        "Star's type. Polygon or Star."
      );

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty("p", "Position", node.data, "Star's position");

      prop.type = PropertyType.multi;
      prop.renderAsOutline = true;
      prop.keyframe = true;
      properties.push(prop);
    } else if (type == shapeType.round) {
      let prop = new NumberProperty(
        "r",
        "Radius",
        node.data,
        "Rounded Corner Radius"
      );

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "rounded_corner";
      properties.push(prop);
    } else if (type == shapeType.repeater) {
      properties.push(
        new ComboProperty(
          "m",
          "Mode",
          Object.values(composite),
          defaultComposite,
          node.data,
          "Composite of copies"
        )
      );

      let data = node.data["tr"] || ({} as transform);
      // Transform Transform values for each repeater copy
      const childProperties = this.getTransfromProperties(node, data);
      childProperties.forEach(p => properties.push(p));

      let prop = new NumberProperty(
        "c",
        "Copies",
        node.data,
        "Number of Copies"
      );

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "format_list_numbered";
      properties.push(prop);
      //{"a": 0, "k": 0}
      prop = new NumberProperty(
        "o",
        "Offset",
        node.data,
        "Offset of Copies default"
      );

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "settings_ethernet";
      properties.push(prop);
    } else if (type == shapeType.rect) {
      const directionProperty = new BoolProperty(
        "d",
        "Direction",
        node.data,
        "Direction how the shape is drawn"
      );

      directionProperty.icon = "swap_horiz";
      properties.push(directionProperty);

      let prop = new NumberProperty(
        "r",
        "Rounded corners",
        node.data,
        "Rect's rounded corners"
      );

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "rounded_corner";
      properties.push(prop);

      prop = new NumberProperty("p", "Position", node.data, "Rect's position");

      prop.type = PropertyType.multi;
      prop.renderAsOutline = true;
      prop.keyframe = true;
      properties.push(prop);

      prop = new NumberProperty("s", "Size", node.data, "Rect's Size");

      prop.type = PropertyType.multi;
      prop.renderAsOutline = true;
      prop.keyframe = true;
      properties.push(prop);
    } else if (type == shapeType.merge) {
      const prop = new TextProperty("mm", "OffMerge Modeset", node.data, "");

      prop.icon = "call_merge";
      properties.push(prop);
    } else if (type == shapeType.gStroke) {
      /**
       * Gradient Colors
       */
      // g: any;

      let prop = new NumberProperty(
        "ml",
        "Miter Limit",
        node.data,
        "Gradient Stroke Miter Limit. Only if Line Join is set to Miter."
      );

      prop.icon = "";
      properties.push(prop);

      properties.push(
        new ComboProperty(
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
          "lg",
          "Line Join",
          Object.values(lineJoint),
          defaultLineJoint,
          node.data,
          ""
        )
      );

      prop = new NumberProperty(
        "w",
        "Stroke Width",
        node.data,
        "Gradient Stroke Width"
      );

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "border_style";
      properties.push(prop);

      prop = new NumberProperty(
        "h",
        "Highlight Length",
        node.data,
        "Gradient Highlight Length. Only if type is Radial"
      );

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty(
        "a",
        "Highlight Angle",
        node.data,
        "Highlight Angle. Only if type is Radial"
      );

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty("o", "Opacity", node.data, "Stroke Opacity");

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "opacity";
      properties.push(prop);

      properties.push(
        new ComboProperty(
          "lc",
          "Line Cap",
          Object.values(lineCap),
          defaultLineCap,
          node.data,
          ""
        )
      );

      prop = new NumberProperty(
        "s",
        "Start Point",
        transform,
        "Gradient Start Point"
      );

      prop.type = PropertyType.multi;
      prop.renderAsOutline = true;
      prop.keyframe = true;
      properties.push(prop);

      prop = new NumberProperty(
        "e",
        "End Point",
        transform,
        "Gradient End Point"
      );

      prop.type = PropertyType.multi;
      prop.renderAsOutline = true;
      prop.keyframe = true;
      properties.push(prop);
    } else if (type == shapeType.group) {
      let prop = new NumberProperty(
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
      //it?: anyShape[];
    } else if (type == shapeType.gFill) {
      /**
       * Gradient Colors
       */
      //g: any;

      properties.push(
        new ComboProperty(
          "t",
          "Gradient Type",
          Object.values(gradientType),
          defaultGradientType,
          node.data,
          ""
        )
      );

      let prop = new NumberProperty(
        "h",
        "Highlight Length",
        node.data,
        "Gradient Highlight Length. Only if type is Radial"
      );

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);
      prop = new NumberProperty(
        "a",
        "Highlight Angle",
        node.data,
        "Highlight Angle. Only if type is Radial"
      );

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "";
      properties.push(prop);

      prop = new NumberProperty("o", "Opacity", node.data, "Stroke Opacity");

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "opacity";
      properties.push(prop);

      prop = new NumberProperty(
        "s",
        "Start Point",
        node.data,
        "Gradient Start Point"
      );

      prop.type = PropertyType.multi;
      prop.renderAsOutline = true;
      prop.keyframe = true;
      properties.push(prop);

      prop = new NumberProperty(
        "e",
        "End Point",
        node.data,
        "Gradient End Point"
      );

      prop.type = PropertyType.multi;
      prop.renderAsOutline = true;
      prop.keyframe = true;
      properties.push(prop);
    } else if (type == shapeType.fill) {
      let prop = new NumberProperty("o", "Opacity", node.data, "Fill Opacity");

      prop.keyframe = true;
      prop.type = PropertyType.value;
      prop.renderAsOutline = true;
      prop.icon = "opacity";
      properties.push(prop);

      let color = new ColorProperty("c", "Color", node.data, "Fill Color");

      color.dataType = "multiDimensional";
      color.renderAsOutline = true;
      color.keyframe = true;
      color.icon = "color_lens";
      properties.push(color);
    } else if (type == shapeType.ellipse) {
      const directionProperty = new BoolProperty(
        "d",
        "Direction",
        node.data,
        "Direction how the shape is drawn"
      );

      directionProperty.icon = "swap_horiz";
      properties.push(directionProperty);

      let prop = new NumberProperty(
        "p",
        "Position",
        node.data,
        "Ellipse's position"
      );

      prop.type = PropertyType.multi;
      prop.renderAsOutline = true;
      prop.keyframe = true;
      properties.push(prop);

      prop = new NumberProperty("s", "Size", node.data, "Ellipse's size");

      prop.type = PropertyType.multi;
      prop.renderAsOutline = true;
      prop.keyframe = true;
      properties.push(prop);
    } else if (type == shapeType.shape) {
      const directionProperty = new BoolProperty(
        "d",
        "Direction",
        node.data,
        "Direction how the shape is drawn"
      );

      directionProperty.icon = "swap_horiz";
      properties.push(directionProperty);

      // shapeProp | shapeKeyframed
      let prop = new NumberProperty(
        "ks",
        "Vertices",
        node.data,
        "Shape's vertices"
      );

      prop.icon = "show_chart";
      prop.type = PropertyType.multi;
      prop.renderAsOutline = true;
      prop.keyframe = true;
      properties.push(prop);
    }
    return properties;
  }

  getLayerProperties(node: Node): Property[] {
    let properties: Property[] = [];

    let nameProperty = new TextProperty("nm", "Name", node.data, "Layer name");
    properties.push(nameProperty);
    node.nameProperty = nameProperty;
    properties.push(
      new BoolProperty(
        "ao",
        "Auto-Orient",
        node.data,
        "Auto-Orient along path AE property"
      )
    );

    let prop = new NumberProperty(
      "ip",
      "In Point",
      node.data,
      "In Point of the Time Ruler. Sets the initial Frame of the animation."
    );
    prop.min = 0;
    prop.keyframe = true;
    properties.push(prop);
    prop = new NumberProperty(
      "op",
      "Out Point",
      node.data,
      "Out of the Time Ruler. Sets the final Frame of the animation"
    );

    prop.min = 0;
    prop.keyframe = true;
    properties.push(prop);

    properties.push(
      new BoolProperty(
        "sr",
        "Time Stretching",
        node.data,
        "Layer Time Stretching"
      )
    );
    properties.push(
      new BoolProperty(
        "st",
        "Start Time of layer",
        node.data,
        "Sets the start time of the layer"
      )
    );
    properties.push(
      new ComboProperty(
        "bm",
        "Blend Mode",
        Object.values(blendMode),
        blendMode.normal,
        node.data,
        ""
      )
    );

    properties.push(new BoolProperty("hasMask", "Has Mask", node.data, ""));

    if (node.data.type === layerType.Solid) {
      let color = new ColorProperty("sc", "Solid Color", node.data, "");
      color.icon = "color_lens";
      color.dataType = "string";
      // Single
      properties.push(color);

      prop = new NumberProperty("sh", "Solid Height", node.data, "");
      prop.min = 0;
      properties.push(prop);

      prop = new NumberProperty("sw", "Solid Width", node.data, "");
      prop.min = 0;
      properties.push(prop);
    }

    return properties;
  }

  getTransfromProperties(node: Node, data: any): Property[] {
    const properties: Property[] = [];
    let prop = new NumberProperty("r", "Rotation", data, "Transform Rotation");

    prop.keyframe = true;
    prop.type = PropertyType.value;
    prop.renderAsOutline = true;
    prop.icon = "autorenew";
    properties.push(prop);

    //{"a":0, "k":100}
    prop = new NumberProperty("o", "Opacity", data, "Transform Opacity");
    prop.min = 0;
    prop.max = 100;
    prop.icon = "opacity";

    //{"a":0, "k":0}
    prop.type = PropertyType.value;
    prop.renderAsOutline = true;
    properties.push(prop);

    /* 
      prop = new NumberProperty("px", "Transform Position X", transform, "");
      prop.type = PropertyType.value;
      properties.push(prop);

      prop = new NumberProperty("py", "Transform Position Y", transform, "");
      prop.type = PropertyType.value;
      properties.push(prop);

      prop = new NumberProperty("pz", "Transform Position Z", transform, "");
      prop.type = PropertyType.value;
      properties.push(prop);
    */

    prop = new NumberProperty("sk", "Skew", data, "Transform Skew");
    prop.icon = "compare_arrows";
    prop.type = PropertyType.value;
    prop.renderAsOutline = true;
    prop.keyframe = true;
    properties.push(prop);

    prop = new NumberProperty(
      "sa",
      "Skew Axis",
      transform,
      "Transform Skew Axis"
    );

    prop.icon = "subdirectory_arrow_right";
    prop.type = PropertyType.value;
    prop.renderAsOutline = true;
    prop.keyframe = true;
    properties.push(prop);

    //{"a":0, "k":[0, 0, 0]}
    prop = new NumberProperty(
      "a",
      "Anchor Point",
      transform,
      "Transform Anchor Point "
    );

    prop.icon = "filter_center_focus";

    prop.type = PropertyType.multi;
    prop.renderAsOutline = true;
    prop.keyframe = true;
    properties.push(prop);

    //{"a":0, "k":[0, 0, 0]}
    prop = new NumberProperty(
      "p",
      "Transform Position",
      data,
      "Transform Anchor Point "
    );
    prop.icon = "photo_size_select_small";
    prop.type = PropertyType.multi;
    prop.renderAsOutline = true;
    prop.keyframe = true;
    properties.push(prop);

    //{"a":0, "k":[100, 100, 100]}
    prop = new NumberProperty("s", "Scale", data, "Transform Scale");

    prop.icon = "settings_overscan";
    prop.type = PropertyType.multi;
    prop.renderAsOutline = true;
    prop.keyframe = true;
    properties.push(prop);

    return properties;
  }
}
