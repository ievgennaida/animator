import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { TreeNode } from "../models/tree-node";

@Injectable({
  providedIn: "root",
})
export class PasteService {
  constructor() {}
  bufferSubject = new BehaviorSubject<TreeNode[]>([]);
  cleanUp(node: Element) {
    if (node) {
      node.removeAttribute("id");
      node.removeAttribute("name");
    }
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        const el = node.children[i] as Element;
        this.cleanUp(el);
      }
    }
  }
  cut() {}
  copy(items: TreeNode[]) {
    this.addToBuffer(items);
  }
  addToBuffer(items: TreeNode[]) {
    this.bufferSubject.next([...items]);
  }
  paste() {}
}
