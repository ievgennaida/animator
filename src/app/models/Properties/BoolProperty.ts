import { Property } from "./Property";
import { PropertyType } from "./PropertyType";
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
