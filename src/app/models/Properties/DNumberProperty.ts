import { Property } from "./Property";
import { NumberProperty } from "./NumberProperty";

export class DNumberProperty extends Property {
  constructor(
    name: string,
    prop1: NumberProperty,
    prop2: NumberProperty,
    description: string = ""
  ) {
    super(null, name, null, description);
    this.prop1 = prop1;
    this.prop2 = prop2;
  }

  prop1: NumberProperty;
  prop2: NumberProperty;
}
