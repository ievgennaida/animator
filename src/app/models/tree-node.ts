import { TimelineRow } from "animation-timeline-js";
import { AdornerData } from "../services/viewport/adorners/adorner-data";
import { IBBox } from "./interfaces/bbox";
import { ICTMProvider } from "./interfaces/ctm-provider";
import { baseLayer } from "./Lottie/layers/baseLayer";
import { LottieModel } from "./Lottie/LottieModel";
import { NodeType } from "./Lottie/NodeType";
import { shapeType } from "./Lottie/shapes/shapeType";
import { PathData } from "./path/path-data";
import { Properties } from "./Properties/Properties";
import { Property } from "./Properties/Property";

/**
 * Application node view model.
 */
export class TreeNode implements ICTMProvider, IBBox {
  constructor() {
    this.lane = {} as TimelineRow;
    this.children = [];
  }
  private cacheBBox: DOMRect = null;

  icon = "folder";
  nameProperty: Property;
  properties: Properties;
  children: TreeNode[];
  parent: TreeNode;
  nodeName = "";
  tag: any;
  shape: any;
  type: any;
  data: any;
  model: LottieModel = null;
  lane: TimelineRow;
  layer?: baseLayer;
  level: number;
  transformable = true;
  allowTranslate = true;
  allowRotate = true;
  allowResize = true;
  // TODO: create cache controller for this.
  cache: any;
  cacheIndex: number;
  mouseOver = false;
  preselected = false;
  selected = false;
  private cacheClientRect: DOMRect;
  private cacheScreenAdorers: AdornerData = new AdornerData();
  private cacheElementAdorers: AdornerData = new AdornerData();
  private ctmCache: DOMMatrix;
  private screenCTMCache: DOMMatrix;
  private _name = "";
  private pathDataCache: PathData;
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
    this.screenCTMCache = null;
    this.ctmCache = null;
    this.cacheBBox = null;
    this.cacheClientRect = null;
    this.cacheElementAdorers.invalidate();
    this.pathDataCache = null;
  }

  cleanScreenCache() {
    this.cacheClientRect = null;
    this.cacheScreenAdorers.invalidate();
  }

  public getPathData(cache = true): PathData {
    if (this.pathDataCache && cache) {
      return this.pathDataCache;
    }

    const pathData = PathData.getPathData(this.getElement());
    if (cache) {
      this.pathDataCache = pathData;
    }

    return pathData;
  }
  public setPathData(data: PathData) {
    this.pathDataCache = data;
    PathData.setPathData(data, this.getElement());
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

  getCTM() {
    if (this.ctmCache) {
      return this.ctmCache;
    }
    const element = this.getElement();
    if (!element) {
      return;
    }
    this.ctmCache = element.getCTM();
    return this.ctmCache;
  }

  getScreenCTM() {
    if (this.screenCTMCache) {
      return this.screenCTMCache;
    }

    const element = this.getElement();
    if (!element) {
      return;
    }
    this.ctmCache = element.getScreenCTM();
    return this.ctmCache;
  }
  /**
   * Get adorner on a screen coordinates
   */
  getScreenAdorners(screenCTM: DOMMatrix): AdornerData {
    if (this.cacheScreenAdorers) {
      // TODO: use cached
      // return this.cacheScreenAdorers;
    }

    this.cacheScreenAdorers = this.adornerToScreen(this.getElementAdorner(), screenCTM);
    return this.cacheScreenAdorers;
  }

  adornerToScreen(adorner: AdornerData, screenCTM: DOMMatrix): AdornerData {
    if (!adorner) {
      return null;
    }
    const ctm = screenCTM.multiply(this.getScreenCTM());
    return adorner.matrixTransform(ctm);
  }
  /**
   * Get cached elements coordinates adorners.
   */
  getElementAdorner(): AdornerData {
    if (this.cacheElementAdorers.invalid) {
      this.cacheElementAdorers.update(this.getElement(), this.getBBox());
    }

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

  strokeWidth(): number {
    // TODO: get stroke width calculated value
    return 1;
  }
}
