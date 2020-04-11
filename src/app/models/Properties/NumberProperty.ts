import { Property } from "./Property";
import { PropertyType } from "./PropertyType";
import { PropertyDataType } from "./PropertyDataType";
import { Keyframe } from "../keyframes/Keyframe";
import { LottieModel } from "../Lottie/LottieModel";
import { TreeNode } from "src/app/models/tree-node";

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
      this.value = Math.round(this.value * 100) / 100;
    }
  }

  getValue(): number | undefined | string {
    if (this.data && this.key) {
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
