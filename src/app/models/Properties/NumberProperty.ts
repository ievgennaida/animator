import { Property } from "./Property";

export class NumberProperty extends Property {
  public min?: number;
  public max?: number;
  public type: NumberPropertyType = NumberPropertyType.default;
}

export enum NumberPropertyType {
  default = "default",
  // value | valueKeyframed
  value = "value",
  //multiDimensional | multiDimensionalKeyframed;
  multi = "multi"
}
