import { TreeNode } from "src/app/models/tree-node";
import { Keyframe } from "../keyframes/keyframe";
import { PropertyDataType } from "./property-data-type";
import { PropertyType } from "./property-type";

// Property view model.
export class Property {
  constructor(
    node: TreeNode,
    key: string,
    name: string,
    data,
    description: string
  ) {
    this.key = key;
    this.name = name;
    this.data = data;
    this.description = description;
    this.node = node;
  }

  public node: TreeNode;
  public readonly = false;
  public key: string;
  public name: string;
  public dataType: PropertyDataType = PropertyDataType.string;
  public dynamicProperty: any = null;
  public description: string;
  // Container to set the data
  public data: any;
  public icon: string;
  // Render this property as outline node:
  public renderAsOutline = false;
  public type: PropertyType = PropertyType.text;
  public keyframes: Keyframe[] = [];
  /**
   * Displayed value.
   */
  public value: any;
  getKeyframes(): Keyframe[] {
    return [];
  }

  /**
   * Get interpolated value at the specific time.
   */
  getValueAtTime(frame: number) {
    if (this.dynamicProperty && this.dynamicProperty.getValueAtTime) {
      if (this.key) {
        const subProperty = this.dynamicProperty[this.key];
        if (subProperty) {
          return subProperty.getValueAtTime(frame);
        }
      } else {
        return this.dynamicProperty.getValueAtTime(frame);
      }
    }

    if (this.data && this.key) {
      return this.data[this.key];
    }
  }

  setValueAtTime(frame: number) {
    this.value = this.getValueAtTime(frame);
  }

  getValue(): any {
    if (this.data instanceof Element) {
      const el = this.data as Element;
      const value = el.getAttribute(this.key);
      return value;
    }
  }

  setValue(value: any): any {
    if (this.data && this.key) {
      this.data[this.key] = value;
    }
  }
}
