import { Injectable } from "@angular/core";
import { TreeNode } from "../models/tree-node";
import { BehaviorSubject, Observable } from "rxjs";
import { HandleData } from "../models/handle-data";

@Injectable({
  providedIn: "root",
})
export class MouseOverService {
  mouseOverSubject = new BehaviorSubject<TreeNode>(null);
  handleOverSubject = new BehaviorSubject<HandleData>(null);
  setMouseOverHandle(data: HandleData) {
    if (data !== this.mouseOverHandle) {
      this.handleOverSubject.next(data);
    }
  }
  leaveHandle() {
    this.setMouseOverHandle(null);
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
      // tslint:disable-next-line: no-bitwise
      (currentHandle.handles & data.handles) === data.handles
    );
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
