import { Injectable } from "@angular/core";
import { Subject, Observable, BehaviorSubject } from "rxjs";
import { TreeNode } from "../models/tree-node";

import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from "@angular/material/tree";
import { FlatTreeControl } from "@angular/cdk/tree";
import { ChangedArgs } from "../models/changed-args";
import { Keyframe } from "../models/keyframes/Keyframe";
import { InputDocument } from "../models/input-document";
import { AppFactory } from "./app-factory";
import { LoggerService } from "./logger.service";

export enum InteractionSource {
  Outline,
  Adorners
}

export enum SelectionMode {
  Normal,
  Add,
  Revert
}

@Injectable({
  providedIn: "root"
})
export class OutlineService {
  constructor(private appFactory: AppFactory, private logger: LoggerService) {}
  mouseOverSubject = new BehaviorSubject<TreeNode>(null);
  nodesSubject = new BehaviorSubject<TreeNode[]>([]);
  selectedSubject = new BehaviorSubject<ChangedArgs>(new ChangedArgs());
  /**
   * Outline tree view model.
   */
  treeConrol = new FlatTreeControl<TreeNode>(
    node => node.level,
    node => node.expandable
  );

  flatDataSource = new MatTreeFlatDataSource<TreeNode, TreeNode>(
    this.treeConrol,
    new MatTreeFlattener<TreeNode, TreeNode>(
      (node: TreeNode, level: number) => {
        node.level = level;
        return node;
      },
      node => node.level,
      node => node.expandable,
      node => node.children
    )
  );

  get flatList() {
    return this.flatDataSource._flattenedData.asObservable();
  }

  deleteElement(array, element) {
    const index: number = array.indexOf(element);
    if (index !== -1) {
      return array.splice(index, 1);
    }
    return array;
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
      // update current view with node selected = false;
      this.mouseOverSubject.next(node);
      this.mouseOverSubject.next(null);
    } else if (this.mouseOverSubject.getValue() !== null) {
      this.mouseOverSubject.next(null);
    }
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

    nodes = nodes as TreeNode[];
    const state = this.selectedSubject.getValue();
    // Keep same ref
    state.changed.length = 0;

    if (nodes && mode === SelectionMode.Add) {
      nodes.forEach(node => {
        const changed = this.changeNodeState(state, node, true);
        if (changed) {
          state.nodes.push(node);
        }
      });
    } else if (nodes && mode === SelectionMode.Revert) {
      nodes.forEach(node => {
        if (state.nodes.includes(node)) {
          this.changeNodeState(state, node, false);
          this.deleteElement(state.nodes, node);
        } else {
          this.changeNodeState(state, node, true);
          state.nodes.push(node);
        }
      });
    } else if (mode === SelectionMode.Normal) {
      if (nodes) {
        nodes.forEach(node => {
          this.changeNodeState(state, node, true);
        });
      }

      state.nodes.forEach(node => {
        const exists = (nodes as TreeNode[]).includes(node);
        // Deselect
        if (!exists) {
          this.changeNodeState(state, node, false);
        }
      });

      if (state.changed.length > 0) {
        if (nodes) {
          state.nodes = nodes;
        } else {
          state.nodes.length = 0;
        }
      }
    }

    if (state.changed.length > 0) {
      this.selectedSubject.next(state);
    }
  }

  setSelectedKeyframes(keyframe: Keyframe) {
    // this.selectedSubject.value.keyframe = keyframe;
    // this.selectedSubject.next(this.selectedSubject.value);
  }

  public get mouseOver(): Observable<TreeNode> {
    return this.mouseOverSubject.asObservable();
  }

  public get selected(): Observable<ChangedArgs> {
    return this.selectedSubject.asObservable();
  }
  public get nodes(): Observable<TreeNode[]> {
    return this.nodesSubject.asObservable();
  }

  public parseDocumentOutline(document: InputDocument) {
    const parser = this.appFactory.getParser(document);
    if (!parser) {
      this.logger.log(
        `Cannot open document ${document.title}. Cannot find a parser for file.`
      );
      return;
    }

    // Parse application:
    let nodes = this.nodesSubject.value;
    nodes.length = 0;
    nodes = parser.parse(document) || [];
    this.flatDataSource.data = nodes;
    this.nodesSubject.next(nodes);
  }

  public deselectAll() {
    this.setSelected(null);
  }

  dispose() {
    this.flatDataSource.data = [];
  }
}
