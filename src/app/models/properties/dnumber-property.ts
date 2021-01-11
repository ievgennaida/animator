import { Property } from "./property";
import { NumberProperty } from "./number-property";
import { PropertyType } from "./property-type";
import { PropertyDataType } from "./property-data-type";
import { TreeNode } from "src/app/models/tree-node";

export class DNumberProperty extends Property {
  constructor(
    node: TreeNode,
    public prop1: NumberProperty,
    public prop2: NumberProperty
  ) {
    super(node, "", "", "", "");
    this.type = PropertyType.dnumber;
    this.dataType = PropertyDataType.multi;
  }

  setValueAtTime(value: number) {
    this.prop1.setValueAtTime(value);
    this.prop2.setValueAtTime(value);
  }
}
