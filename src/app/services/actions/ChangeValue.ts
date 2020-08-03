import { BaseAction } from "./BaseAction";
import { Keyframe } from "src/app/models/keyframes/Keyframe";

export class ChangeValue extends BaseAction {
  keyframes: Array<Keyframe> = [];
  do(): void {}

  undo(): void {}
}
