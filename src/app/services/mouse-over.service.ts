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

export enum MouseOverMode {
  Elements,
  Containers,
}
export class MouseOverContainer {
  node: TreeNode | null = null;
}
@Injectable({
  providedIn: "root",
})
export class MouseOverService {
  constructor() {}
  /**
   * Mouse over mode.
   */
  mouseOverModeSubject = new BehaviorSubject<MouseOverMode>(
    MouseOverMode.Elements
  );

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
      currentHandle.handles === data.handles
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
      return currentHandle.handles === data;
    }
    return true;
  }

  getValue(): TreeNode {
    return this.mouseOverSubject.getValue();
  }

  /**
   * Selection mode list.
   * @param mode mouse over mode.
   */
  setMode(mode: MouseOverMode): void {
    if (mode !== this.mouseOverModeSubject.getValue()) {
      this.mouseOverModeSubject.next(mode);
    }
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
