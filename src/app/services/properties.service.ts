import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { PathData } from "../models/path/path-data";
import { NumberProperty } from "../models/properties/number-property";
import { Property } from "../models/properties/property";
import { TreeNode } from "../models/tree-node";
import { Utils } from "./utils/utils";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CenterTransformX = "transform-center-x";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CenterTransformY = "transform-center-y";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TransformPropertyKey = "transform";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PathDataPropertyKey = "d";
@Injectable({
  providedIn: "root",
})
export class PropertiesService {
  changedSubject = new Subject<Property>();
  public get changed(): Observable<Property> {
    return this.changedSubject.asObservable();
  }

  public emitPropertyChanged(property: Property) {
    this.changedSubject.next(property);
  }

  setAttributes(node: TreeNode, values: Map<string, any>) {
    if (!values) {
      return;
    }
    values.forEach((value, key) => {
      this.setAttribute(node, key, value);
    });
  }
  setAttribute(node: TreeNode, key: string, val: any): boolean {
    if (!node) {
      return false;
    }

    const element = node.getElement();
    if (!element) {
      return false;
    }

    if (val === null) {
      element.removeAttribute(key);
    } else {
      const toSet = val?.toString() || "";
      element.setAttribute(key, toSet);
    }

    const property = this.getPropertyByKey(node, key);
    if (property) {
      this.emitPropertyChanged(property);
    }
    return true;
  }
  public setPathData(node: TreeNode, data: PathData) {
    node.cleanCache();
    const element = node.getElement();
    const changed = PathData.setPathData(data, element);
    if (changed) {
      const property = this.getPropertyByKey(node, PathDataPropertyKey);
      if (property) {
        this.emitPropertyChanged(property);
      }
    }
  }

  getPropertyByKey<T extends Property>(node: TreeNode, key: string): T {
    const property = node?.properties?.items?.find((p) => p.key === key) as T;
    return property;
  }
  unset(node: TreeNode, key: string) {
    const element = node.getElement();
    if (element) {
      element.removeAttribute(key);
    }
  }
  setMatrixTransform(node: TreeNode, matrix: DOMMatrix | null): boolean {
    const element = node.getElement();
    if (!matrix || !element) {
      return false;
    }
    const transform = Utils.getElementTransform(element);
    transform.setMatrix(matrix);
    element.transform.baseVal.initialize(transform);
    const property = this.getPropertyByKey(node, TransformPropertyKey);
    if (property) {
      this.emitPropertyChanged(property);
    }
    return true;
    return false;
  }
  /**
   * Transform transformation center by matrix.
   */
  transformCenterByMatrix(
    node: TreeNode,
    matrix: DOMMatrix,
    point: DOMPoint | null = null
  ): boolean {
    if (this.isCenterTransformSet(node)) {
      let transform = point || this.getCenterTransform(node, true);
      if (!transform) {
        return false;
      }
      transform = transform.matrixTransform(matrix);
      const bbox = node.getBBox();
      if (!bbox) {
        return false;
      }
      transform.x -= bbox.x;
      transform.y -= bbox.y;
      this.setCenterTransform(node, transform.x, transform.y);
      return true;
    }
    return false;
  }
  isCenterTransformSet(node: TreeNode) {
    const x = this.getNum(node, CenterTransformX);
    const y = this.getNum(node, CenterTransformY);
    return (x !== null && !isNaN(x)) || (y !== null && !isNaN(y));
  }
  /**
   * Check whether exact node is displayed
   */
  isVisible(node: TreeNode) {
    return !!(node?.getElement()?.style?.display !== "none");
  }
  setDisplay(node: TreeNode, value: string | boolean): boolean {
    const element = node?.getElement();

    if (element) {
      if (typeof value === "boolean") {
        if (value) {
          element.style.display = "";
        } else {
          element.style.display = "none";
        }
      } else {
        element.style.display = value;
      }

      return true;
    }
    return false;
  }
  /**
   * get stored center transform.
   *
   * @param relative whether coordinates should be global or relative to the element position (in element coordinates system)
   */
  getCenterTransform(node: TreeNode, relative = false): DOMPoint | null {
    if (!node || !node.getElement()) {
      return null;
    }
    let x = this.getNum(node, CenterTransformX);
    let y = this.getNum(node, CenterTransformY);
    const bboxCache = node.getBBox();
    if (!bboxCache) {
      return null;
    }
    const center = Utils.getRectCenter(bboxCache, relative);
    if (x === null || isNaN(x)) {
      x = center?.x || 0;
    } else if (!relative) {
      x += bboxCache.x;
    }
    if (y === null || isNaN(y)) {
      y = center?.y || 0;
    } else if (!relative) {
      y += bboxCache.y;
    }

    const transformPoint = new DOMPoint(x, y);
    return transformPoint;
  }
  setCenterTransform(
    node: TreeNode,
    x: number | null,
    y: number | null
  ): boolean {
    let changed = this.setNum(node, CenterTransformX, x);
    changed = changed || this.setNum(node, CenterTransformY, y);
    return changed;
  }

  setNum(node: TreeNode, key: string, val: number | null): boolean {
    const element = node.getElement();
    if (!element) {
      return false;
    }
    if (val === null) {
      if (element.hasAttribute(key)) {
        element.removeAttribute(key);
        return true;
      } else {
        return false;
      }
    }

    // Get property definition
    const propertyConfig = this.getPropertyByKey<NumberProperty>(node, key);

    val = Utils.round(val);
    if (propertyConfig) {
      if (propertyConfig.min || propertyConfig.min === 0) {
        if (val <= propertyConfig.min) {
          return false;
        }
      } else if (propertyConfig.max || propertyConfig.max === 0) {
        if (val >= propertyConfig.max) {
          return false;
        }
      }
    }
    this.setAttribute(node, key, val);
    return true;
  }
  getNum(node: TreeNode, key: string): number | null {
    const val = this.getAttributeValue<string | SVGLength>(node, key);
    if (typeof val === "string") {
      if (!val) {
        return null;
      }

      const value = parseInt(val, 10);
      if (isNaN(value)) {
        return null;
      }
      return value;
    }
    if (val instanceof SVGLength) {
      return val.value;
    } else {
      return null;
    }
  }

  /**
   * Get list of the attributes.
   *
   * @param node node to get attributes from.
   * @param keys list of the attributes properties.
   */
  getAttributes(node: TreeNode, keys: string[]): Map<string, any> {
    const map = new Map<string, any>();
    keys.forEach((key) => map.set(key, this.getAttributeString(node, key)));
    return map;
  }

  getAttributeString(node: TreeNode, key: string): string {
    const element = node.getElement();
    const propAttribute = element?.getAttribute(key);
    return propAttribute || "";
  }
  getAttributeValue<T>(node: TreeNode, key: string): T | string | null {
    const element = node.getElement();
    if (!element) {
      return null;
    }
    const propAttribute = (element as any)[key];
    if (!propAttribute) {
      return element.getAttribute(key);
    }
    const val = propAttribute.baseVal;
    if (!val) {
      return null;
    }
    return val;
  }
}
