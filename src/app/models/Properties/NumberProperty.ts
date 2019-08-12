import { Property } from "./Property";
import { PropertyType } from "./PropertyType";
import { PropertyDataType } from "./PropertyDataType";

export class NumberProperty extends Property {
  constructor(key, name, data, description) {
    super(key, name, data, description);
    this.type = PropertyType.number;
    this.dataType = PropertyDataType.number;
  }

  public min?: number;
  public max?: number;

  getValue(): number | undefined | string {
    if (this.data && this.key) {
      let data = this.data[this.key];
      if (data && this.dataType === PropertyDataType.value) {
        if (data.k !== undefined) {
          data = data.k;
        }
      }

      if (data === undefined) {
        return "";
      } else {
        return parseInt(data);
      }
    }
  }

  setValue(value: number): any {
    if (this.data && this.key) {
      if (this.dataType === PropertyDataType.value) {
        let prop = this.data[this.key] || {};
        prop.k = value;
      } else {
        this.data[this.key] = value;
      }
    }
  }
}
