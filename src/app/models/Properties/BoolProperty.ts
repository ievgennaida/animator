import { Property } from "./Property";
import { PropertyType } from "./PropertyType";
import { Node } from "src/app/models/Node";

export class BoolProperty extends Property {
  constructor(
    node: Node,
    key: string,
    name: string,
    data,
    description: string
  ) {
    super(node, key, name, data, description);
    this.type = PropertyType.bool;
  }
}
