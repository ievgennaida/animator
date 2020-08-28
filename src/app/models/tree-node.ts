import { TimelineRow } from "animation-timeline-js";
import { Utils } from '../services/utils/utils';
import { Adorner } from "../services/viewport/adorners/adorner";
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
  mouseOver = false;
  preselected = false;
  selected = false;
  private cacheClientRect: DOMRect;
  private cacheAdorners: Adorner | null = null;
  private ctmCache: DOMMatrix;
  private screenCTMCache: DOMMatrix;
  // tslint:disable-next-line: variable-name
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
    this.screenCTMCache = null;
    this.ctmCache = null;
    this.cacheBBox = null;
    this.cacheClientRect = null;
    this.cacheAdorners = null;
    this.pathDataCache = null;
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
   * Get adorner manipulation points points in screen coordinates.
   */
  getAdorners(): Adorner {
    if (this.cacheAdorners) {
      return this.cacheAdorners;
    }

    this.cacheAdorners = new Adorner();
    this.cacheAdorners.node = this;
    const bounds = this.getBBox();
    this.cacheAdorners.fromRect(bounds);
    this.cacheAdorners.setCenterTransform(Utils.getCenterTransform(this.getElement(), bounds));
    this.cacheAdorners = this.cacheAdorners.matrixTransform(
      this.getScreenCTM()
    );
    return this.cacheAdorners;
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
