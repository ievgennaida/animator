import { Property } from "./Property";
import { PropertyType } from "./PropertyType";
import { PropertyDataType } from "./PropertyDataType";
import { Keyframe } from '../keyframes/Keyframe';
import { LottieModel } from '../Lottie/LottieModel';

export class NumberProperty extends Property {
  constructor(model: LottieModel, key, name, data, description) {
    super(key, name, data, description);
    this.type = PropertyType.number;
    this.dataType = PropertyDataType.number;
    this.model = model;
  }
  public model: LottieModel;
  public min?: number;
  public max?: number;
  getKeyframes(): Keyframe[] {
    let keyframes: Keyframe[] = [];

    if (this.data && this.key) {
      let data = this.data[this.key];
      if (data && 
        (this.dataType === PropertyDataType.value ||
         this.dataType === PropertyDataType.multi)) {
        if (data.k !== undefined) {
          if (data.k.length >= 0) {
            for (let i = 0; i < data.k.length; i++) {
              let frame = data.k[i];
              if(frame.t != undefined) {
                let keyframe = new Keyframe();
                keyframe.property = this;
                keyframe.key = 't';
                keyframe.container  = frame;
                keyframe.model = this.model;
                keyframes.push(keyframe);
              }
            }
          }
        }
      }

    }

    return keyframes;
  }

  getValue(): number | undefined | string {
    if (this.data && this.key) {
      let data = this.data[this.key];
      if (data && this.dataType === PropertyDataType.value) {
        if (data.k !== undefined) {
          if (data.k.length) {
            data = data.k;
          }
        }
      }

      if (data === undefined) {
        return "";
      } else {
        return parseInt(data);
      }
    }
  }

  setValue(value: number): any {
    if (this.data && this.key) {
      if (this.dataType === PropertyDataType.value) {
        let prop = this.data[this.key] || {};
        prop.k = value;
      } else {
        this.data[this.key] = value;
      }
    }
  }
}
