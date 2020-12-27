import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { TreeNode } from "../models/tree-node";
import { OutlineService } from "./outline.service";
import { PathDataSelectionSubject } from "./path-data-subject";
import {
  ChangeStateMode,
  State,
  StateChangedSource,
  StateSubject,
} from "./state-subject";
import { Utils } from "./utils/utils";
import { AdornerType } from "./viewport/adorners/adorner-type";
@Injectable({
  providedIn: "root",
})
export class SelectionService {
  constructor(private outlineService: OutlineService) {}
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
  getTopSelectedNode(node: TreeNode): TreeNode | null {
    if (!node || !node.selected || !node.transformable) {
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

  /**
   * Get unique list of top selected nodes.
   * ex: parent node is selected and some of the children.
   * Only parent will be returned.
   */
  getTopSelectedNodes(): TreeNode[] {
    const topNodes = [];
    const selected = this.getSelected();
    selected.forEach((p) => {
      const top = this.getTopSelectedNode(p);
      if (topNodes.indexOf(p) < 0) {
        topNodes.push(top);
      }
    });

    return topNodes;
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
    this.setSelected(toSelect, ChangeStateMode.Normal);
    return toSelect;
  }
  inverseSelection() {
    const toSelect = this.outlineService
      .getAllNodes()
      .filter((p) => p && !p.selected);
    this.setSelected(toSelect, ChangeStateMode.Normal);
  }

  deselect(
    nodes: TreeNode[] | TreeNode,
    source: StateChangedSource = StateChangedSource.NotSet
  ) {
    this.setSelected(nodes, ChangeStateMode.Remove, source);
  }
  setSelected(
    nodes: TreeNode[] | TreeNode,
    mode: ChangeStateMode = ChangeStateMode.Normal,
    source: StateChangedSource = StateChangedSource.NotSet
  ) {
    this.selectedSubject.change(nodes, mode, source);
  }
}
