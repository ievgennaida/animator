import { Injectable } from "@angular/core";
import { OutlineService } from "./outline.service";
import { TreeNode } from "../models/tree-node";
import { Observable } from "rxjs";
import { Utils } from "./utils/utils";
import { AdornerType } from "./viewport/adorners/adorner-type";
import { StateSubject, State, ChangeStateMode } from "./state-subject";
import { PathDataSelectionSubject } from "./path-data-subject";
import { environment } from "src/environments/environment";
@Injectable({
  providedIn: "root",
})
export class SelectionService {
  constructor(private outlineService: OutlineService) {}
  selectedSubject = new StateSubject<TreeNode>(
    (node: TreeNode, value: boolean) => {
      // Change the selected property on changed callback.
      if (node && node.selected !== value) {
        node.selected = value;
        return true;
      }

      return false;
    }
  );
  pathDataSubject = new PathDataSelectionSubject();
  selectedAdorner: AdornerType = AdornerType.None;
  deselectAdorner() {
    this.setSelectedAdorner(AdornerType.None);
  }
  setSelectedAdorner(value: AdornerType) {
    this.selectedAdorner = value;
  }
  isAdornerHandleSelected(value: AdornerType) {
    return Utils.bitwiseEquals(this.selectedAdorner, value);
  }

  /**
   * Get top most selected node from current.
   * @param node Node to start top-search from.
   */
  getTopSelectedNode(node: TreeNode) {
    if (!node.selected || !node.transformable) {
      return null;
    }

    let toReturn = node;
    while (node != null) {
      node = node.parent;
      if (node) {
        if (node.selected && node.transformable) {
          toReturn = node;
        } else if (!node.transformable) {
          break;
        }
      }
    }

    return toReturn;
  }

  getSelected(): TreeNode[] {
    return this.selectedSubject.getValues();
  }

  selectAll() {
    this.setSelected(this.outlineService.getAllNodes(), ChangeStateMode.Append);
  }

  /**
   * Check whether node command is selected and handles are active.
   * @param node path command.
   * @param commandIndex node index.
   */
  isPathHandlesActivated(node: TreeNode, commandIndex: number): boolean {
    if (environment.debug) {
      // Show all handles
      return true;
    }
    // check whether path command or any neighbor is selected.
    const anySelected =
      !!this.pathDataSubject.getHandle(node, commandIndex) ||
      !!this.pathDataSubject.getHandle(node, commandIndex - 1) ||
      !!this.pathDataSubject.getHandle(node, commandIndex + 1);
    return anySelected;
  }
  getSelectedElements(): SVGGraphicsElement[] {
    const renderable = this.getSelected().filter((p) => p.getElement());

    return renderable.map((p) => p.getElement());
  }

  public deselectAll() {
    this.setSelected(null);
  }

  public get selected(): Observable<State<TreeNode>> {
    return this.selectedSubject.asObservable();
  }

  selectSameType() {
    const selectedNodes = this.getSelected();
    const toSelect = this.outlineService
      .getAllNodes()
      .filter(
        (p) => p && p.type && selectedNodes.find((n) => n.type === p.type)
      );
    this.setSelected(toSelect, ChangeStateMode.Normal);
  }
  inverseSelection() {
    const toSelect = this.outlineService
      .getAllNodes()
      .filter((p) => p && !p.selected);
    this.setSelected(toSelect, ChangeStateMode.Normal);
  }

  setSelected(
    nodes: TreeNode[] | TreeNode,
    mode: ChangeStateMode = ChangeStateMode.Normal
  ) {
    this.selectedSubject.change(nodes, mode);
  }
}
