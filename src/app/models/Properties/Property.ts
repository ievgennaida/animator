import { PropertyType } from "./PropertyType";
import { PropertyDataType } from "./PropertyDataType";
import { Keyframe } from "../Keyframes/Keyframe";

// Property view model.
export class Property {
  constructor(key, name, data, description) {
    this.key = key;
    this.name = name;
    this.data = data;
    this.description = description;
  }

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
    return this.keyframes;
  }

  getValueAtTime(frame: number){
    if (this.dynamicProperty && this.dynamicProperty.getValueAtTime) {
      if (this.key) {
        let subproperty = this.dynamicProperty[this.key];
        if (subproperty) {
          return subproperty.getValueAtTime(frame);
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
    if (this.data && this.key) {
      return this.data[this.key];
    }
  }

  setValue(value: any): any {
    if (this.data && this.key) {
      this.data[this.key] = value;
    }
  }
}
