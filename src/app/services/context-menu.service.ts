import { Injectable } from "@angular/core";
import { TreeNode } from "../models/tree-node";
import { Subject } from "rxjs";
import { MatMenuTrigger } from "@angular/material/menu";
export class ContextEventArgs {
  event: MouseEvent | null = null;
  node: TreeNode | null = null;
}

@Injectable({
  providedIn: "root",
})
export class ContextMenuService {
  openSubject = new Subject<ContextEventArgs | null>();
  private trigger: MatMenuTrigger | null = null;
  private container: HTMLElement | null = null;

  constructor() {}
  setElement(container: HTMLElement) {
    this.container = container;
  }
  setTrigger(trigger: MatMenuTrigger | null) {
    this.trigger = trigger;
  }
  isParent(
    node: HTMLElement | Node | any,
    parent: Node | HTMLElement
  ): boolean {
    if (!parent || !node) {
      return false;
    }
    while (node) {
      if (
        node === parent ||
        (node.classList && node.classList.contains("mat-menu-panel"))
      ) {
        return true;
      }
      if (node) {
        node = node.parentNode;
      }
    }

    return false;
  }
  onWindowMouseDown(event: MouseEvent | any): boolean {
    if (this.isOpened()) {
      if (this.container) {
        if (this.isParent(event.target, this.container)) {
          return true;
        } else {
          this.close();
          return true;
        }
      }
    }
    return false;
  }

  isOpened() {
    return this.trigger && this.trigger.menuOpen;
  }
  close() {
    this.openSubject.next(null);
  }
  open(event: MouseEvent, node: TreeNode | null) {
    const args = new ContextEventArgs();
    args.event = event;
    args.node = node;
    this.openSubject.next(args);
  }
}
