import { slider } from "./slider";
import { point } from "./point";
import { tint } from "./tint";
import { fill } from "./fill";
import { stroke } from "./stroke";
import { tritone } from "./tritone";
import { dropDown } from "./dropDown";
import { group } from "./group";
import { color } from "./color";
import { proLevels } from "./proLevels";
import { angle } from "./angle";
import { layer } from "./layer";
import { customValue } from "./customValue";
import { checkBox } from "./checkBox";

export type index =
  | slider
  | point
  | tint
  | fill
  | stroke
  | tritone
  | proLevels
  | color
  | checkBox
  | group
  | angle
  | layer
  | dropDown
  | customValue
  | null
  | undefined;
