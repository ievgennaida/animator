import { TimelineKeyframe } from "animation-timeline-js";
import { Property } from "../properties/property";
export class Keyframe implements TimelineKeyframe {
  keyframesLaneSizePx?: number;
  selected?: boolean;
  keyframesShape?: string;
  hidden?: boolean;
  draggable?: boolean;
  public property: Property | null = null;
  public key: string | null = null;
  public container: string | null = null;

  get data() {
    return this;
  }
  val = 0;
}
