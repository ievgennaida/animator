import { TreeNode } from "src/app/models/tree-node";
import { Utils } from "src/app/services/utils/utils";
import { Property } from "./property";
import { PropertyDataType } from "./property-data-type";
import { PropertyType } from "./property-type";

export class NumberProperty extends Property {
  public index: number | null = null;

  public min?: number;
  public step = 0.5;
  public max?: number;
  constructor(
    node: TreeNode,
    key: string,
    name: string,
    data: any,
    description: string
  ) {
    super(node, key, name, data, description);
    this.type = PropertyType.number;
    this.dataType = PropertyDataType.number;
  }
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
        return parseInt(value || '', 10);
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
        return parseInt(data, 10);
      }
    }
    return undefined;
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
