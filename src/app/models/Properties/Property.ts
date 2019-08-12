import { PropertyType } from './PropertyType';
import { PropertyDataType } from './PropertyDataType';
import { Keyframe } from '../Keyframes/Keyframe';

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
  public description: string;
  // Container to set the data
  public data: any;
  public icon: string;
  // Render this property as outline node:
  public renderAsOutline = false;
  public type: PropertyType = PropertyType.text;
  public keyframes: Keyframe[] = [];
  getKeyframes(): Keyframe[] {
    return this.keyframes;
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
