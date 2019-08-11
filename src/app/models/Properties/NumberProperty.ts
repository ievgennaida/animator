import { Property } from "./Property";
import { PropertyType } from './PropertyType';

export class NumberProperty extends Property {
  constructor(key, name, data, description) {
    super(key, name, data, description);
    this.type = PropertyType.number;
  }

  public min?: number;
  public max?: number;

  getValue(): number | undefined | string {
    if (this.data && this.key) {
      let number = this.data[this.key];
      if (number === undefined) {
        return '';
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
