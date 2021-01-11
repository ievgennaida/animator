import { Property } from "./property";
import { PropertyType } from "./property-type";
import { TreeNode } from "src/app/models/tree-node";

export class ComboProperty extends Property {
  constructor(
    node: TreeNode,
    key: string,
    name: string,
    items,
    defaultItem,
    data,
    description: string
  ) {
    super(node, key, name, data, description);
    this.type = PropertyType.combo;
  }

  items: any[];
  defaultItem: any;
}
