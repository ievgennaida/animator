import { TimelineKeyframe } from "animation-timeline-js";
import { Property } from "../Properties/Property";
export class Keyframe implements TimelineKeyframe {
  keyframesLaneSizePx?: number;
  selected?: boolean;
  keyframesShape?: string;
  hidden?: boolean;
  draggable?: boolean;
  public property: Property = null;
  public key: string = null;
  public container: string = null;

  get data() {
    return this;
  }
  val = 0;
}
