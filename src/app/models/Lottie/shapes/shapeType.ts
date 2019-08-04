import { baseShape } from "./baseShape";
import { shape } from "./shape";
import { group } from "./group";
import { rect } from "./rect";
import { ellipse } from "./ellipse";
import { star } from "./star";
import { fill } from "./fill";
import { gFill } from "./gFill";
import { trim } from "./trim";
import { gStroke } from "./gStroke";
import { round } from "./round";
import { stroke } from "./stroke";
import { merge } from "./merge";
import { repeater } from './repeater';
import { transform } from './transform';

export enum shapeType {
  shape = "sh",
  gStroke = "gs",
  group = "gr",
  gFill = "gf",
  fill = "fl",
  ellipse = "el",
  trim = "tm",
  stroke = "st",
  star = "sr",
  round = "rd",
  repeater = "rp",
  rect = "rc",
  merge = "mm",
  transform = "tr"
}

export type anyShape  = baseShape | shape | gStroke | group | gFill | fill | ellipse | trim | stroke | star | round | repeater| rect | merge | transform;