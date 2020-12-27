import { TreeNode } from "src/app/models/tree-node";
import { Utils } from "src/app/services/utils/utils";
import { Property } from "./Property";
import { PropertyDataType } from "./PropertyDataType";
import { PropertyType } from "./PropertyType";

export class NumberProperty extends Property {
  constructor(node: TreeNode, key, name, data, description) {
    super(node, key, name, data, description);
    this.type = PropertyType.number;
    this.dataType = PropertyDataType.number;
  }

  public index: number | null = null;

  public min?: number;
  public step = 0.5;
  public max?: number;

  setValueAtTime(frame: number) {
    const value = this.getValueAtTime(frame);
    if (this.index !== null && value) {
      this.value = value[this.index];
    } else {
      this.value = value;
    }

    if ((this.value || this.value === 0) && this.value) {
      // two digits after coma.
      this.value = Utils.round(this.value);
    }
  }

  getValue(): number | undefined | string {
    if (this.data && this.key) {
      if (this.data instanceof Element) {
        const el = this.data as Element;
        const value = el.getAttribute(this.key);
        return parseInt(value);
      }
      let data = this.data[this.key];
      if (data && this.dataType === PropertyDataType.value) {
        if (data.k !== undefined) {
          if (data.k.length) {
            data = data.k;
          }
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
        const prop = this.data[this.key] || {};
        prop.k = value;
      } else {
        this.data[this.key] = value;
      }
    }
  }
}
