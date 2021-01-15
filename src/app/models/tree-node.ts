import { TimelineRow } from "animation-timeline-js";
import { Utils } from "../services/utils/utils";
import { Adorner } from "./adorner";
import { IBBox } from "./interfaces/bbox";
import { ICTMProvider } from "./interfaces/ctm-provider";
import { PathData } from "./path/path-data";
import { Properties } from "./properties/properties";
import { Property } from "./properties/property";

export enum Flags {
  /**
   * Disable all transformations
   */
  disableTransform = "disableTransform",
  disableTranslate = "disableRemove",
  disableRemove = "disableRemove",
  disableRotate = "disableRotate",
  disableScale = "disableScale",
  disableMouseOver  = "disableMouseOver"
}

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
  /**
   * Root document element node.
   */
  isRoot = false;
  nameProperty: Property;
  properties: Properties = new Properties();
  children: TreeNode[];
  parent: TreeNode;
  nodeName = "";
  flags: (string | Flags)[] = [];
  tag: any;
  shape: any;
  type: string;
  data: any;

  lane: TimelineRow;
  level: number;

  mouseOver = false;
  selected = false;
  private cacheClientRect: DOMRect;
  private screenCTMCache: DOMMatrix;
  // tslint:disable-next-line: variable-name
  private _name = "";
  private pathDataCache: PathData;
  typeTitle = "";

  get name(): string {
    return this._name || this.typeTitle;
  }

  set name(value: string) {
    this._name = value;
  }

  get allowRemove(): boolean {
    return !this.containsFlags(Flags.disableRemove);
  }
  get allowTransform(): boolean {
    return !this.containsFlags(Flags.disableTransform);
  }
  get allowTranslate(): boolean {
    return !this.containsFlags(Flags.disableTranslate, Flags.disableTransform);
  }
  get allowRotate(): boolean {
    return !this.containsFlags(Flags.disableRotate, Flags.disableTransform);
  }
  get allowResize(): boolean {
    return !this.containsFlags(Flags.disableScale, Flags.disableTransform);
  }
  /**
   * Current node index in the virtual nodes DOM.
   * -1 when detached or virtual.
   */
  get index(): number {
    if (!this.parentNode || !this.parentNode.children) {
      return -1;
    }
    return this.parentNode.children.indexOf(this);
  }

  /**
   * Get index of the element in DOM.
   * -1 when detached or virtual.
   */
  get indexDOM(): number {
    const element = this.getElement();
    return Utils.getElementIndex(element);
  }
  // Note: flag is not cause screen refresh. Should be handled by the tree view control.
  expanded = false;
  get expandable(): boolean {
    return !!this.children && this.children.length > 0;
  }

  get parentNode(): TreeNode {
    return this.parent;
  }
  get ownerSVGElement(): SVGSVGElement | null {
    return this.getElement()?.ownerSVGElement;
  }
  addFlag(flag: Flags | string) {
    if (!this.flags.includes(flag)) {
      this.flags.push(flag);
    }
  }
  containsFlags(...params: (Flags | string)[]): boolean {
    if (!params && params.length === 0) {
      return false;
    }
    return !!this.flags.find((p) => params.includes(p));
  }
  getElement(): SVGGraphicsElement | null {
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
    this.cacheBBox = null;
    this.cacheClientRect = null;
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
    if (this.screenCTMCache) {
      return this.screenCTMCache;
    }

    const element = this.getElement();
    if (!element) {
      return;
    }
    this.screenCTMCache = element.getScreenCTM();
    return this.screenCTMCache;
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

  strokeWidth(): number {
    // TODO: get stroke width calculated value
    return 1;
  }
}
