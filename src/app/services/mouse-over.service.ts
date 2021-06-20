import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { AdornerContainer } from "../models/adorner";
import { AdornerPointType } from "../models/adorner-point-type";
import { AdornerType } from "../models/adorner-type";
import { HandleData } from "../models/handle-data";
import { TreeNode } from "../models/tree-node";
import { PathDataSelectionSubject } from "./path-data-subject";

export enum MouseOverMode {
  elements,
  containers,
}
export class MouseOverContainer {
  node: TreeNode | null = null;
}
@Injectable({
  providedIn: "root",
})
export class MouseOverService {
  /**
   * Mouse over mode.
   */
  mouseOverModeSubject = new BehaviorSubject<MouseOverMode>(
    MouseOverMode.elements
  );

  /**
   * Mouse over node.
   */
  mouseOverSubject = new BehaviorSubject<TreeNode | null>(null);
  /**
   * Mouse over resize adorner handle
   */
  mouseOverHandleSubject = new BehaviorSubject<HandleData | null>(null);

  /**
   * Mouse over path data handle
   */
  pathDataSubject = new PathDataSelectionSubject();
  constructor() {}
  setMouseOverHandle(data: HandleData | null): boolean {
    if (data !== this.mouseOverHandle) {
      this.mouseOverHandleSubject.next(data);
      return true;
    }
    return false;
  }
  leaveHandle(): boolean {
    return this.setMouseOverHandle(null);
  }
  get mouseOverHandle(): HandleData | null {
    return this.mouseOverHandleSubject.getValue();
  }

  /**
   * Get node, any type of handle
   */
  overNode(): TreeNode | null {
    return (
      this.getValue() ||
      this.mouseOverHandle?.adorner?.node ||
      this.pathDataSubject.getValues().find((p) => p.node)?.node ||
      null
    );
  }
  isMouseOverHandle(data: HandleData): boolean {
    const currentHandle = this.mouseOverHandleSubject.getValue();
    if (!currentHandle || !data) {
      return false;
    }

    return (
      currentHandle?.adorner?.node === data?.adorner?.node &&
      currentHandle.handle === data.handle
    );
  }
  isMouseOverAdornerHandle(
    adorner: AdornerContainer | null = null,
    data: AdornerPointType | null = null
  ): boolean {
    const currentHandle = this.mouseOverHandleSubject.getValue();
    if (!data) {
      return !!currentHandle;
    }
    if (!currentHandle || !currentHandle.adorner) {
      return false;
    }
    if (
      (adorner &&
        currentHandle.adorner &&
        currentHandle.adorner.node === adorner.node) ||
      (currentHandle.adorner.type === AdornerType.selection &&
        currentHandle.adorner.type === adorner?.type)
    ) {
      return currentHandle.handle === data;
    }
    return true;
  }

  getValue(): TreeNode | null {
    return this.mouseOverSubject.getValue();
  }

  /**
   * Selection mode list.
   *
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

  setMouseLeave(node: TreeNode | null) {
    if (node && node.mouseOver) {
      node.mouseOver = false;
      // update current subscribers with node selected = false;
      this.mouseOverSubject.next(node);
      this.mouseOverSubject.next(null);
    } else if (this.mouseOverSubject.getValue() !== null) {
      this.mouseOverSubject.next(null);
    }
  }
}
