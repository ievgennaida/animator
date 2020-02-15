import { Property } from "./Property";
import { PropertyType } from "./PropertyType";
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
