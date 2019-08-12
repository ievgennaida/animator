import { AnimationTimelineKeyframe } from "animation-timeline-js";
import { Node } from "../Node";
import { Property } from "../Properties/Property";
import { LottieModel } from "../Lottie/LottieModel";

interface TimelineKeyframe extends AnimationTimelineKeyframe {}

export class Keyframe implements TimelineKeyframe {
  public model: LottieModel = null;
  public property: Property = null;
  public key: string = null;
  public container: string = null;

  get data() {
    return this;
  }

  get val() {
    if (this.property && this.model && this.model.fr) {
      let value = 0;
      if (this.container && this.key) {
        value = this.container[this.key];
      } else {
        value = this.property.setValue(value);
      }

      return Math.round((value * 1000) / this.model.fr);
    }

    return 0;
  }

  set val(val: number) {
    if (this.property && this.model && this.model.fr) {
      let value = Math.round((val / 1000) * this.model.fr);
      if (this.container && this.key) {
        this.container[this.key] = value;
      } else {
        this.property.setValue(value);
      }
    }
  }
}
