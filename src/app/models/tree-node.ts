import { TimelineRow } from "animation-timeline-js";
import { Utils } from "../services/utils/utils";
import { Adorner, AdornerMode } from "../services/viewport/adorners/adorner";
import { IBBox } from "./interfaces/bbox";
import { ICTMProvider } from "./interfaces/ctm-provider";
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
  /**
   * Root document element node.
   */
  isRoot = false;
  nameProperty: Property;
  properties: Properties;
  children: TreeNode[];
  parent: TreeNode;
  nodeName = "";
  tag: any;
  shape: any;
  type: any;
  data: any;

  lane: TimelineRow;
  level: number;
  transformable = true;
  allowDelete = true;
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
  typeTitle = "";
  get name(): string {
    return this._name || this.typeTitle;
  }

  set name(value: string) {
    this._name = value;
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
  /**
   * Get tree node untransformed bbox in element coordinates.
   * @param node node to get untransformed bbox for.
   */
  untransformedBBox(bbox: DOMRect | null = null): Adorner | null {
    if (!bbox) {
      bbox = this.getBBox();
    }
    const screenRect = Utils.matrixRectTransform(
      bbox,
      this.getScreenCTM(),
      true
    );
    const adorner = Adorner.fromDOMRect(screenRect).matrixTransform(
      this.getScreenCTM().inverse()
    );
    adorner.node = this;
    adorner.isScreen = false;
    adorner.mode = AdornerMode.ElementsBounds;
    return adorner;
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
