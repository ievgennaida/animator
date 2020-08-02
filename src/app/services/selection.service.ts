import { Injectable } from "@angular/core";
import { OutlineService } from "./outline.service";
import { ChangedArgs } from "../models/changed-args";
import { TreeNode } from "../models/tree-node";
import { BehaviorSubject, Observable } from "rxjs";
import { Utils } from "./utils/utils";
import { AdornerType } from "./viewport/adorners/adorner-type";
/**
 * Timeline selection mode.
 */
export enum SelectionMode {
  /**
   * Select new items. deselect changed.
   */
  Normal = "normal",
  /**
   * Append current selection.
   */
  Append = "append",
  /**
   * Revert selection of a specified nodes.
   */
  Revert = "revert",
}

@Injectable({
  providedIn: "root",
})
export class SelectionService {
  constructor(private outlineService: OutlineService) {}
  selectedSubject = new BehaviorSubject<ChangedArgs>(new ChangedArgs());

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
    const selector = this.selectedSubject.getValue();
    return selector.nodes;
  }

  selectAll() {
    this.setSelected(this.outlineService.getAllNodes(), SelectionMode.Append);
  }

  getSelectedElements(): SVGGraphicsElement[] {
    const renderable = this.getSelected().filter((p) => p.getElement());

    return renderable.map((p) => p.getElement());
  }

  public deselectAll() {
    this.setSelected(null);
  }

  public get selected(): Observable<ChangedArgs> {
    return this.selectedSubject.asObservable();
  }

  selectSameType() {
    const selectedNodes = this.getSelected();
    const toSelect = this.outlineService
      .getAllNodes()
      .filter(
        (p) => p && p.type && selectedNodes.find((n) => n.type === p.type)
      );
    this.setSelected(toSelect, SelectionMode.Normal);
  }
  inverseSelection() {
    const toSelect = this.outlineService
      .getAllNodes()
      .filter((p) => p && !p.selected);
    this.setSelected(toSelect, SelectionMode.Normal);
  }
  private changeNodeState(
    state: ChangedArgs,
    node: TreeNode,
    value: boolean
  ): boolean {
    if (node.selected !== value) {
      node.selected = value;
      state.changed.push(node);
      return true;
    }

    return false;
  }

  setSelected(
    nodes: TreeNode[] | TreeNode,
    mode: SelectionMode = SelectionMode.Normal
  ) {
    if (!nodes) {
      nodes = [];
    }
    if (nodes instanceof TreeNode) {
      nodes = [nodes];
    }

    const converted = nodes as TreeNode[];
    const state = this.selectedSubject.getValue();
    // Keep same ref
    state.changed.length = 0;

    if (converted && mode === SelectionMode.Append) {
      converted.forEach((node) => {
        const changed = this.changeNodeState(state, node, true);
        if (changed) {
          state.nodes.push(node);
        }
      });
    } else if (converted && mode === SelectionMode.Revert) {
      converted.forEach((node) => {
        if (state.nodes.includes(node)) {
          this.changeNodeState(state, node, false);
          Utils.deleteElement<TreeNode>(state.nodes, node);
        } else {
          this.changeNodeState(state, node, true);
          state.nodes.push(node);
        }
      });
    } else if (mode === SelectionMode.Normal) {
      if (converted) {
        converted.forEach((node) => {
          this.changeNodeState(state, node, true);
        });
      }

      state.nodes.forEach((node) => {
        const exists = converted.includes(node);
        // Deselect
        if (!exists) {
          this.changeNodeState(state, node, false);
        }
      });

      if (state.changed.length > 0) {
        if (converted) {
          state.nodes = converted;
        } else {
          state.nodes.length = 0;
        }
      }
    }

    if (state.changed.length > 0) {
      this.selectedSubject.next(state);
    }
  }
}
