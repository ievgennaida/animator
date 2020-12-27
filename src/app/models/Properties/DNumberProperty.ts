import { Property } from "./Property";
import { NumberProperty } from "./NumberProperty";
import { PropertyType } from "./PropertyType";
import { PropertyDataType } from "./PropertyDataType";
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
