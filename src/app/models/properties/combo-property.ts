import { Property } from "./property";
import { PropertyType } from "./property-type";
import { TreeNode } from "src/app/models/tree-node";

export class ComboProperty extends Property {
  items: any[] = [];
  defaultItem: any;
  constructor(
    node: TreeNode,
    key: string,
    name: string,
    items: any[],
    defaultItem: any,
    data: any,
    description: string
  ) {
    super(node, key, name, data, description);
    this.items = items;
    this.type = PropertyType.combo;
  }
}
