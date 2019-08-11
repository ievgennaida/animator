import { Property } from "./Property";
import { PropertyType } from './PropertyType';

export class ComboProperty extends Property {
  constructor(key, name, items, defaultItem, data, description) {
    super(key, name, data, description);
    this.type = PropertyType.combo;
  }

  items: any[];
  defaultItem: any;
}
