import { Property } from "./Property";
import { PropertyType } from './PropertyType';

export class BoolProperty extends Property {
    constructor(key, name, data, description) {
        super(key, name, data, description);
        this.type = PropertyType.bool;
      }
    
}
