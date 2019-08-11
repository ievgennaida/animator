import { Property } from "./Property";
import { PropertyType } from "./PropertyType";

export class ColorProperty extends Property {
  constructor(key, name, data, description) {
    super(key, name, data, description);
    this.type = PropertyType.color;
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
          return `rgba(${k[0]}, ${k[1]}, ${k[2]}, ${k[3]})`;
        }
      }
    }
  }
}
