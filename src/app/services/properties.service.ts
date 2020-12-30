import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { min } from "rxjs/operators";
import { NumberProperty } from "../models/Properties/NumberProperty";
import { Property } from "../models/Properties/Property";
import { TreeNode } from "../models/tree-node";
import { Utils } from "./utils/utils";

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
      element.setAttribute(key, val?.toString() || "");
    }

    const property = this.getPropertyByKey(node, key);
    if (property) {
      this.emitPropertyChanged(property);
    }
    return true;
  }

  getPropertyByKey<T extends Property>(node: TreeNode, key: string): T {
    const property = node?.properties?.items?.find((p) => p.key === key) as T;
    return property;
  }
  unset(node: TreeNode, key: string) {
    const element = node.getElement();
    element.removeAttribute(key);
  }

  setNum(node: TreeNode, key: string, val: number | null): boolean {
    const element = node.getElement();
    if (val === null) {
      element.removeAttribute(key);
      return true;
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
  getNum(node: TreeNode, key: string): number {
    const val = this.getAttributeValue<SVGLength>(node, key);
    if (val) {
      return val.value;
    } else {
      return null;
    }
  }

  /**
   * Get list of the attributes.
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
    const propAttribute = element.getAttribute(key);
    return propAttribute;
  }
  getAttributeValue<T>(node: TreeNode, key: string): T {
    const element = node.getElement();
    const propAttribute = element[key];
    if (!propAttribute) {
      return null;
    }
    const val = propAttribute.baseVal;
    if (!val) {
      return null;
    }
    return val;
  }
}
