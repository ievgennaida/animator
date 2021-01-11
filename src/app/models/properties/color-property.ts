import { Property } from "./property";
import { PropertyType } from "./property-type";
import { PropertyDataType } from "./property-data-type";
import { TreeNode } from "src/app/models/tree-node";

export class ColorProperty extends Property {
  constructor(
    node: TreeNode,
    key: string,
    name: string,
    data,
    description: string
  ) {
    super(node, key, name, data, description);
    this.type = PropertyType.color;
    this.dataType = PropertyDataType.number;
  }

  rgbToHex(rgb) {
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
      hex = "0" + hex;
    }
    return hex;
  }

  toHex(r, g, b) {
    var red = this.rgbToHex(r);
    var green = this.rgbToHex(g);
    var blue = this.rgbToHex(b);
    return red + green + blue;
  }

  getValue(): number | undefined | string {
    if (this.data && this.key) {
      let data = this.data[this.key];
      if (data && data.k) {
        let k = data.k;

        if (Array.isArray(k) && k.length >= 4) {
          let toReturn = `rgba(${k[0]}, ${k[1]}, ${k[2]}, ${k[3]})`;
          return toReturn;
        }
      }
    }
  }
}
