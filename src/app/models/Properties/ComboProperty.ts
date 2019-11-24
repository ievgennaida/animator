import { Property } from "./Property";
import { PropertyType } from "./PropertyType";
import { Node } from "src/app/models/Node";

export class ComboProperty extends Property {
  constructor(
    node: Node,
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
