import { AnimationTimelineKeyframe } from "animation-timeline-js";
import { Node } from "../Node";
import { Property } from "../Properties/Property";

interface TimelineKeyframe extends AnimationTimelineKeyframe {}

export class Keyframe implements TimelineKeyframe {
  public node: Node = null;
  public property: Property = null;
  get data() {
    return this;
  }

  get val() {
    if (this.property && this.node && this.node.model && this.node.model.fr) {
      let value = this.property.getValue();
      return Math.round((value * 1000) / this.node.model.fr);
    }

    return this.val;
  }

  set val(val: number) {
    if (this.property && this.node && this.node.model) {
      let value = Math.round((val / 1000) * this.node.model.fr);
      this.property.setValue(value);
    }
  }
}
