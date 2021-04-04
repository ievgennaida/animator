import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AdornerPointType } from "../models/adorner-point-type";
import { PathDataCommand } from "../models/path/path-data-command";
import { TreeNode } from "../models/tree-node";
import { OutlineService } from "./outline.service";
import { PathDataSelectionSubject } from "./path-data-subject";
import {
  ChangeStateMode,
  State,
  StateChangedSource,
  StateSubject,
} from "./state-subject";

@Injectable({
  providedIn: "root",
})
export class SelectionService {
  selectedSubject = new StateSubject<TreeNode>(
    // On selected changed:
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
  selectedAdorner: AdornerPointType = AdornerPointType.none;
  constructor(private outlineService: OutlineService) {}
  deselectAdorner() {
    this.setSelectedAdorner(AdornerPointType.none);
  }
  setSelectedAdorner(value: AdornerPointType) {
    this.selectedAdorner = value;
  }
  isAdornerHandleSelected(value: AdornerPointType) {
    return this.selectedAdorner === value;
  }

  /**
   * Get top most selected node from current.
   *
   * @param node Node to start top-search from.
   */
  getTopSelectedNode(node: TreeNode | null): TreeNode | null {
    if (!node || !node.selected) {
      return null;
    }

    let toReturn = node;
    while (node != null) {
      node = node.parent;
      if (node) {
        if (node.selected) {
          toReturn = node;
        }
      }
    }

    return toReturn;
  }

  /**
   * Get unique list of top selected nodes.
   * ex: parent node is selected and some of the children.
   * Only parent will be returned.
   */
  getTopSelectedNodes(): TreeNode[] {
    const topNodes: TreeNode[] = [];
    const selected = this.getSelected();
    selected.forEach((p) => {
      const top = this.getTopSelectedNode(p);
      if (top && topNodes.indexOf(top) < 0) {
        topNodes.push(top);
      }
    });

    return topNodes;
  }

  getSelected(): TreeNode[] {
    return this.selectedSubject.getValues();
  }

  selectAll() {
    this.setSelected(this.outlineService.getAllNodes(), ChangeStateMode.append);
  }

  /**
   * Check whether node command is selected and handles are active.
   *
   * @param node path command.
   * @param commandIndex node index.
   */
  isPathHandlesActivated(node: TreeNode, command: PathDataCommand): boolean {
    if (environment.debug) {
      // Show all handles
      return true;
    }
    // check whether path command or any neighbor is selected.
    const anySelected =
      !!this.pathDataSubject.getHandle(node, command) ||
      !!this.pathDataSubject.getHandle(node, command.prev) ||
      !!this.pathDataSubject.getHandle(node, command.next);
    return anySelected;
  }
  getSelectedElements(): SVGGraphicsElement[] {
    const renderable = this.getSelected().filter((p) => p.getElement());
    if (!renderable) {
      return [];
    }
    return renderable.map((p) => p.getElement() as SVGGraphicsElement);
  }

  public deselectAll() {
    this.setSelected(null);
  }

  public get selected(): Observable<State<TreeNode>> {
    return this.selectedSubject.asObservable();
  }

  selectSameType(): TreeNode[] {
    const types = this.getSelected().map((p) => p.type);
    return this.selectByTypes(types);
  }
  selectAllGroups(): TreeNode[] {
    return this.selectByTypes(["g"]);
  }

  selectByTypes(types: string[]): TreeNode[] {
    const toSelect = this.outlineService
      .getAllNodes()
      .filter((p) => p && p.type && types.find((n) => n === p.type));
    this.setSelected(toSelect, ChangeStateMode.normal);
    return toSelect;
  }
  inverseSelection() {
    const toSelect = this.outlineService
      .getAllNodes()
      .filter((p) => p && !p.selected);
    this.setSelected(toSelect, ChangeStateMode.normal);
  }

  deselect(
    nodes: TreeNode[] | TreeNode,
    source: StateChangedSource = StateChangedSource.notSet
  ) {
    this.setSelected(nodes, ChangeStateMode.remove, source);
  }
  setSelected(
    nodes: TreeNode[] | TreeNode | null,
    mode: ChangeStateMode = ChangeStateMode.normal,
    source: StateChangedSource = StateChangedSource.notSet
  ) {
    this.selectedSubject.change(nodes, mode, source);
  }
}
