import { Injectable } from "@angular/core";
import { TreeNode } from "../models/tree-node";
import { BehaviorSubject, Observable } from "rxjs";
import { AdornerType } from './viewport/adorners/adorner-type';

@Injectable({
  providedIn: "root",
})
export class MouseOverService {
  mouseOverSubject = new BehaviorSubject<TreeNode>(null);
  handles: AdornerType = AdornerType.None;
  setMouseOverHandle(value: AdornerType) {
    this.handles = value;
  }
  isMouseOverHandle(value: AdornerType){
   // tslint:disable-next-line: no-bitwise
   return (this.handles & value) === value;
  }
  setMouseLeaveHandle(){
    
  }
  getValue(): TreeNode {
    return this.mouseOverSubject.getValue();
  }
  setMouseOver(node: TreeNode) {
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
