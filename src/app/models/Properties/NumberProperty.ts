import { Property } from "./Property";

export class NumberProperty extends Property {
  public min?: number;
  public max?: number;
  public type: NumberPropertyType = NumberPropertyType.default;

  getValue(): number | undefined {
    if (this.data && this.key) {
      let number = this.data[this.key];
      if (number === undefined) {
        return;
      } else {
        return parseInt(number);
      }
    }
  }

  setValue(value: number): any {
    if (this.data && this.key) {
      this.data[this.key] = value;
    }
  }
}

export enum NumberPropertyType {
  default = "default",
  // value | valueKeyframed
  value = "value",
  //multiDimensional | multiDimensionalKeyframed;
  multi = "multi"
}
