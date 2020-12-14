import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { HandleData } from "../models/handle-data";
import { PathDataHandle } from "../models/path-data-handle";
import { TreeNode } from "../models/tree-node";
import { PathDataSelectionSubject } from "./path-data-subject";
import { ChangeStateMode } from "./state-subject";
import { Utils } from "./utils/utils";
import { Adorner, AdornerMode } from "./viewport/adorners/adorner";
import { AdornerType } from "./viewport/adorners/adorner-type";

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
  mouseOverHandleSubject = new BehaviorSubject<HandleData>(null);

  /**
   * Mouse over path data handle
   */
  pathDataSubject = new PathDataSelectionSubject();

  setMouseOverPathData(node: TreeNode, mouseOverItems: Array<number>) {
    this.pathDataSubject.change(
      mouseOverItems.map((p) => new PathDataHandle(node, p)),
      ChangeStateMode.Normal
    );
  }
  setMouseOverHandle(data: HandleData): boolean {
    if (data !== this.mouseOverHandle) {
      this.mouseOverHandleSubject.next(data);
      return true;
    }
    return false;
  }
  leaveHandle(): boolean {
    return this.setMouseOverHandle(null);
  }
  get mouseOverHandle(): HandleData {
    return this.mouseOverHandleSubject.getValue();
  }
  isMouseOverHandle(data: HandleData): boolean {
    const currentHandle = this.mouseOverHandleSubject.getValue();
    if (!currentHandle || !data) {
      return false;
    }

    return (
      currentHandle.adorner.node === data.adorner.node &&
      Utils.bitwiseEquals(currentHandle.handles, data.handles)
    );
  }
  isMouseOverAdornerHandle(
    adorner: Adorner = null,
    data: AdornerType | null = null
  ): boolean {
    const currentHandle = this.mouseOverHandleSubject.getValue();
    if (!data) {
      return !!currentHandle;
    }
    if (!currentHandle) {
      return false;
    }
    if (
      (adorner &&
        currentHandle.adorner &&
        currentHandle.adorner.node === adorner.node) ||
      (currentHandle.adorner.mode === AdornerMode.Selection &&
        currentHandle.adorner.mode === adorner.mode)
    ) {
      return Utils.bitwiseEquals(currentHandle.handles, data);
    }
    return true;
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
