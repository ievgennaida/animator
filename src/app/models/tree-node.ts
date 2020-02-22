import {
  default as timeline,
  AnimationTimelineOptions,
  Timeline,
  AnimationTimelineLane
} from "animation-timeline-js";
import { baseLayer } from "./Lottie/layers/baseLayer";
import { Properties } from "./Properties/Properties";
import { Property } from "./Properties/Property";
import { shapeType } from "./Lottie/shapes/shapeType";
import { LottieModel } from "./Lottie/LottieModel";
import { NodeType } from './Lottie/NodeType';

/**
 * Application node view model.
 */
export class TreeNode {
  constructor() {
    this.lane = {} as AnimationTimelineLane;
    this.children = [];
  }

  private _name = "";

  get name(): string {
    return this._name || this.typeTitle;
  }

  set name(value: string) {
    this._name = value;
  }

  get expandable(): boolean {
    return !!this.children && this.children.length > 0;
  }

  get typeTitle() {
    let typeTitle = NodeType[this.type];
    if (this.type === NodeType.Shape && this.data) {
      const typeSubtitle = Object.keys(shapeType).find(
        value => shapeType[value] === this.data.ty
      );
      if (typeSubtitle) {
        typeTitle += ` (${typeSubtitle})`;
      }
    }
    return typeTitle;
  }

  icon = "folder";
  nameProperty: Property;
  properties: Properties;
  children: TreeNode[];
  tag: any;
  shape: any;
  type: any;
  data: any;
  model: LottieModel = null;
  selected = false;
  lane: AnimationTimelineLane;
  layer?: baseLayer;
  level: number;
  // TODO: create cache controller for this.
  cache: any;
  cacheIndex: number;
  mouseOver = false;
}
