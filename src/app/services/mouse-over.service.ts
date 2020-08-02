import { Injectable } from "@angular/core";
import { TreeNode } from "../models/tree-node";
import { BehaviorSubject, Observable } from "rxjs";
import { HandleData } from "../models/handle-data";
import { AdornerType } from "./viewport/adorners/adorner-type";
import { Utils } from "./utils/utils";

@Injectable({
  providedIn: "root",
})
export class MouseOverService {
  constructor() {}
  /**
   * Mouse over node.
   */
  mouseOverSubject = new BehaviorSubject<TreeNode>(null);
  /**
   * Mouse over resize adorner handle
   */
  handleOverSubject = new BehaviorSubject<HandleData>(null);
  setMouseOverHandle(data: HandleData): boolean {
    if (data !== this.mouseOverHandle) {
      this.handleOverSubject.next(data);
      return true;
    }
    return false;
  }
  leaveHandle(): boolean {
    return this.setMouseOverHandle(null);
  }
  get mouseOverHandle(): HandleData {
    return this.handleOverSubject.getValue();
  }
  isMouseOverHandle(data: HandleData): boolean {
    const currentHandle = this.handleOverSubject.getValue();
    if (!currentHandle || !data) {
      return false;
    }

    return (
      currentHandle.node === data.node &&
      Utils.bitwiseEquals(currentHandle.handles, data.handles)
    );
  }
  isMouseOverAdornerHandle(data: AdornerType | null = null): boolean {
    const currentHandle = this.handleOverSubject.getValue();
    if (!data) {
      return !!currentHandle;
    }
    if (!currentHandle) {
      return false;
    }

    return Utils.bitwiseEquals(currentHandle.handles, data);
  }

  getValue(): TreeNode {
    return this.mouseOverSubject.getValue();
  }
  setMouseOver(node: TreeNode): void {
    if (node && !node.mouseOver) {
      node.mouseOver = true;
      this.mouseOverSubject.next(node);
    }
  }

  setMouseLeave(node: TreeNode) {
    if (node && node.mouseOver) {
      node.mouseOver = false;
      // update current subscribers with node selected = false;
      this.mouseOverSubject.next(node);
      this.mouseOverSubject.next(null);
    } else if (this.mouseOverSubject.getValue() !== null) {
      this.mouseOverSubject.next(null);
    }
  }

  public get mouseOver(): Observable<TreeNode> {
    return this.mouseOverSubject.asObservable();
  }
}
