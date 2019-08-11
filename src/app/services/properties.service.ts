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

@Injectable({
  providedIn: "root"
})
export class PropertiesService {
  constructor() {}
  changedSubject = new Subject();
  public get сhanged(): Observable<any> {
    return this.changedSubject.asObservable();
  }

  public emitPropertyChanged() {
    this.changedSubject.next();
  }

  getProperties(node: Node): Properties {
    let property = new Properties();
    const properties = (property.items = []);

    // App properties
    if (node.type == NodeType.File) {
      let nameProperty =new TextProperty("nm", "Name", node.data, "Composition name");
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

      properties.push(
        new NumberProperty(
          "fr",
          "Frame Rate",
          node.data,
          "Frame Rate. 30 and 60 are recomended"
        )
      );

      prop =new NumberProperty("h", "Height", node.data, "Composition Height");
      prop.min = 0;
      properties.push(prop);
      
      prop = new NumberProperty("w", "Width", node.data, "Composition Width");
      prop.min = 0;
      properties.push(prop);
      //  properties.push(new NumberProperty('ddd','Width', node.data, 'Composition Width'));
    } else if (node.type == NodeType.Layer) {
      let transformProperties = this.getLayerProperties(node);
      transformProperties.forEach(p => properties.push(p));

      // Transform. Transform properties
      transformProperties = this.getTransfromProperties("ks", node);
      transformProperties.forEach(p => properties.push(p));
    } else if (node.type == NodeType.Shape) {
    }

    return property;
  }

  getLayerProperties(node: Node): Property[] {
    let properties: Property[] = [];

    let nameProperty =new TextProperty("nm", "Name", node.data, "Layer name");
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
      properties.push(new ColorProperty("sc", "Solid Color", node.data, ""));

      properties.push(new NumberProperty("sh", "Solid Height", node.data, ""));

      properties.push(new NumberProperty("sw", "Solid Width", node.data, ""));
    }

    return properties;
  }

  getTransfromProperties(key, node: Node): Property[] {
    const properties: Property[] = [];
    let transform = node.data[key] || ({} as transform);

    let prop = new NumberProperty(
      "r",
      "Rotation",
      transform,
      "Transform Rotation"
    );

    prop.keyframe = true;
    prop.type = PropertyType.value;
    prop.renderAsOutline = true;
    prop.icon = "autorenew";
    properties.push(prop);

    //{"a":0, "k":100}
    prop = new NumberProperty("o", "Opacity", transform, "Transform Opacity");
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

    prop = new NumberProperty("sk", "Skew", transform, "Transform Skew");
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
      transform,
      "Transform Anchor Point "
    );
    prop.icon = "photo_size_select_small";
    prop.type = PropertyType.multi;
    prop.renderAsOutline = true;
    prop.keyframe = true;
    properties.push(prop);

    //{"a":0, "k":[100, 100, 100]}
    prop = new NumberProperty("s", "Scale", transform, "Transform Scale");

    prop.icon = "settings_overscan";
    prop.type = PropertyType.multi;
    prop.renderAsOutline = true;
    prop.keyframe = true;
    properties.push(prop);

    return properties;
  }
}
