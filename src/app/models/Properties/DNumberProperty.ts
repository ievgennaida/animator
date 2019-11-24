import { Property } from "./Property";
import { NumberProperty } from "./NumberProperty";
import { LottieModel } from '../Lottie/LottieModel';
import { PropertyType } from './PropertyType';
import { PropertyDataType } from './PropertyDataType';

export class DNumberProperty extends Property {
  constructor(model: LottieModel, key, name, data, description, dynamicProperty) {
    super(key, name, data, description);
    this.type = PropertyType.dnumber;
    this.dataType = PropertyDataType.multi;
    this.prop1 = new NumberProperty(model, key, '', data, 'x');
    this.prop1.dynamicProperty = dynamicProperty;
    // Index in a data array.
    this.prop1.index = 0;
    this.prop2 = new NumberProperty(model, key, '', data, 'y');
    this.prop2.index = 1;
    this.prop2.dynamicProperty = dynamicProperty;
  }

  setValueAtTime(value:number){
    this.prop1.setValueAtTime(value);
    this.prop2.setValueAtTime(value);
  }

  prop1: NumberProperty;
  prop2: NumberProperty;
}
