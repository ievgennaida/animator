import { Property } from "./Property";

export class ComboProperty extends Property {
  constructor(key, name, items, defaultItem, data, description) {
    super(key, name, data, description);
  }

  items: any[];
  defaultItem: any;
}
