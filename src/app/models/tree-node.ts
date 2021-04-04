import { TimelineRow } from "animation-timeline-js";
import { Utils } from "../services/utils/utils";
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
  disableMouseOver = "disableMouseOver",
}

/**
 * Application node view model.
 */
export class TreeNode implements ICTMProvider, IBBox {
  icon = "folder";
  /**
   * Root document element node.
   */
  isRoot = false;
  nameProperty: Property | null = null;
  properties: Properties = new Properties();
  children: TreeNode[] | null = null;
  parent: TreeNode | null = null;
  nodeName = "";
  flags: (string | Flags)[] = [];
  tag: any;
  shape: any;
  type = "";
  data: any;

  lane: TimelineRow | null = null;
  level = 0;

  mouseOver = false;
  selected = false;
  typeTitle = "";
  // Note: flag is not cause screen refresh. Should be handled by the tree view control.
  expanded = false;
  private cacheClientRect: DOMRect | null = null;
  private screenCTMCache: DOMMatrix | null = null;
  private cacheBBox: DOMRect | null = null;

  private _name = "";
  private pathDataCache: PathData | null = null;

  constructor() {
    this.lane = {} as TimelineRow;
    this.children = [];
  }
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

  get expandable(): boolean {
    return !!this.children && this.children.length > 0;
  }

  get parentNode(): TreeNode | null {
    return this.parent;
  }
  get ownerSVGElement(): SVGSVGElement | null {
    return this.getElement()?.ownerSVGElement || null;
  }
  addFlag(flag: Flags | string): void {
    if (!this.flags.includes(flag)) {
      this.flags.push(flag);
    }
  }
  addChild(child: TreeNode): void {
    if (!child) {
      return;
    }
    if (!this.children) {
      this.children = [];
    }
    this.children.push(child);
  }
  containsFlags(...params: Array<Flags | string>): boolean {
    if (!params || params.length === 0) {
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

  cleanCache(): void {
    this.screenCTMCache = null;
    this.cacheBBox = null;
    this.cacheClientRect = null;
    this.pathDataCache = null;
  }

  public getPathData(cache = true): PathData | null {
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
  getBoundingClientRect(): DOMRect | null {
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

  getScreenCTM(): DOMMatrix | null {
    if (this.screenCTMCache) {
      return this.screenCTMCache;
    }

    const element = this.getElement();
    if (!element) {
      return null;
    }
    this.screenCTMCache = element.getScreenCTM();
    return this.screenCTMCache;
  }

  /**
   * get cached bbox.
   */
  getBBox(): DOMRect | null {
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
