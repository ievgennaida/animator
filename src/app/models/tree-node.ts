import { AnimationTimelineLane } from "animation-timeline-js";
import { baseLayer } from "./Lottie/layers/baseLayer";
import { Properties } from "./Properties/Properties";
import { Property } from "./Properties/Property";
import { shapeType } from "./Lottie/shapes/shapeType";
import { LottieModel } from "./Lottie/LottieModel";
import { NodeType } from "./Lottie/NodeType";
import { AdornerData } from "../services/viewport/adorners/adorner-data";
import { PathData } from "./path/path-data";

/**
 * Application node view model.
 */
export class TreeNode {
  constructor() {
    this.lane = {} as AnimationTimelineLane;
    this.children = [];
  }
  private cacheBBox: DOMRect = null;

  icon = "folder";
  nameProperty: Property;
  properties: Properties;
  children: TreeNode[];
  parent: TreeNode;
  tag: any;
  shape: any;
  type: any;
  data: any;
  model: LottieModel = null;
  lane: AnimationTimelineLane;
  layer?: baseLayer;
  level: number;
  transformable = true;
  // TODO: create cache controller for this.
  cache: any;
  cacheIndex: number;
  mouseOver = false;
  preselected = false;
  selected = false;
  private cacheClientRect: DOMRect = null;
  private cacheScreenAdorers: AdornerData = null;
  private cacheElementAdorers: AdornerData = null;
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

  getElement(): SVGGraphicsElement {
    if (!this.tag) {
      return null;
    }
    if (this.tag instanceof SVGGraphicsElement) {
      return this.tag as SVGGraphicsElement;
    }
    if (this.tag.layerElement instanceof SVGGraphicsElement) {
      return this.tag.layerElement as SVGGraphicsElement;
    }

    return null;
  }

  cleanCache() {
    this.cleanElementCache();
    this.cleanScreenCache();
  }

  cleanElementCache() {
    this.cacheClientRect = null;
    this.cacheElementAdorers = null;
  }

  cleanScreenCache() {
    this.cacheClientRect = null;
    this.cacheScreenAdorers = null;
  }

  public getPathData(): PathData {
    return PathData.getPathData(this.getElement());
  }
  /**
   * get cached bounding client rect.
   */
  getBoundingClientRect(): DOMRect {
    if (this.cacheClientRect) {
      return this.cacheClientRect;
    }
    const element = this.getElement();
    if (element && element.getBoundingClientRect) {
      this.cacheClientRect = element.getBoundingClientRect();
      return this.cacheClientRect;
    }
    return null;
  }

  getScreenCTM() {
    const element = this.getElement();
    if (!element) {
      return;
    }
    return element.getScreenCTM();
  }
  /**
   * Get adorner on a screen coordinates
   */
  getScreenAdorners(screenCTM: DOMMatrix): AdornerData {
    if (this.cacheScreenAdorers) {
      return this.cacheScreenAdorers;
    }
    let elementAdorner = this.getElementAdorner();
    if (!elementAdorner) {
      return;
    }
    const ctm = screenCTM.multiply(this.getScreenCTM());
    elementAdorner = elementAdorner.getTransformed(ctm);
    this.cacheScreenAdorers = elementAdorner;
    return this.cacheScreenAdorers;
  }

  /**
   * Get cached elements coordinates adorners.
   */
  getElementAdorner(): AdornerData {
    if (this.cacheElementAdorers) {
      return this.cacheElementAdorers;
    }
    this.cacheElementAdorers = AdornerData.create(
      this.getElement(),
      this.getBBox()
    );
    return this.cacheElementAdorers;
  }

  /**
   * get cached bbox.
   */
  getBBox(): DOMRect {
    if (this.cacheBBox) {
      return this.cacheBBox;
    }
    const element = this.getElement();
    if (element && element.getBBox) {
      this.cacheBBox = element.getBBox();
      return this.cacheBBox;
    }
    return null;
  }

  get typeTitle() {
    let typeTitle = NodeType[this.type];
    if (this.type === NodeType.Shape && this.data) {
      const typeSubtitle = Object.keys(shapeType).find(
        (value) => shapeType[value] === this.data.ty
      );
      if (typeSubtitle) {
        typeTitle += ` (${typeSubtitle})`;
      }
    }
    return typeTitle;
  }
}
