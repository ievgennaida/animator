import { Property } from "./Property";
import { NumberProperty } from "./NumberProperty";
import { LottieModel } from '../Lottie/LottieModel';
import { PropertyType } from './PropertyType';
import { PropertyDataType } from './PropertyDataType';
import { Node } from "src/app/models/Node";

export class DNumberProperty extends Property {
  constructor(node: Node, key, name, data, description, dynamicProperty) {
    super(node, key, name, data, description);
    this.type = PropertyType.dnumber;
    this.dataType = PropertyDataType.multi;
    this.prop1 = new NumberProperty(node, key, '', data, 'x');
    this.prop1.dynamicProperty = dynamicProperty;
    // Index in a data array for a multi.
    this.prop1.index = 0;

    this.prop2 = new NumberProperty(node, key, '', data, 'y');
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
