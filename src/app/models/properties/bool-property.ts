import { Property } from "./property";
import { PropertyType } from "./property-type";
import { TreeNode } from "src/app/models/tree-node";

export class BoolProperty extends Property {
  constructor(
    node: TreeNode,
    key: string,
    name: string,
    data,
    description: string
  ) {
    super(node, key, name, data, description);
    this.type = PropertyType.bool;
  }
}
