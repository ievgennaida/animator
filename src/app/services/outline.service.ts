import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { TreeNode } from "../models/tree-node";

import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from "@angular/material/tree";
import { FlatTreeControl } from "@angular/cdk/tree";
import { Keyframe } from "../models/keyframes/Keyframe";
import { InputDocument } from "../models/input-document";
import { AppFactory } from "./app-factory";
import { LoggerService } from "./logger.service";

export enum InteractionSource {
  Outline,
  Adorners,
}

@Injectable({
  providedIn: "root",
})
export class OutlineService {
  constructor(private appFactory: AppFactory, private logger: LoggerService) {
    this.treeControl.expansionModel.changed.subscribe((state) => {
      state.added.forEach((p) => {
        p.expanded = true;
      });
      state.removed.forEach((p) => {
        p.expanded = false;
      });
    });

    this.nodesSubject.subscribe((nodes) => {
      // Sync expanded state with the tree node properties when changed
      if (nodes) {
        nodes.forEach((node) => {
          if (node.expandable && node.expanded) {
            this.treeControl.expand(node);
          } else {
            this.treeControl.collapse(node);
          }
        });
      }
    });
  }

  nodesSubject = new BehaviorSubject<TreeNode[]>([]);

  /**
   * Outline tree view model.
   */
  treeControl = new FlatTreeControl<TreeNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  flatDataSource = new MatTreeFlatDataSource<TreeNode, TreeNode>(
    this.treeControl,
    new MatTreeFlattener<TreeNode, TreeNode>(
      (node: TreeNode, level: number) => {
        node.level = level;
        return node;
      },
      (node) => node.level,
      (node) => node.expandable,
      (node) => node.children
    )
  );

  get flatList() {
    return this.flatDataSource._flattenedData.asObservable();
  }
  clear() {
    // Remove outline expanded cache
    this.treeControl.expansionModel.clear();
  }
  /**
   * Expand all items from current node to top
   * @param node Node to start top-search from.
   */
  expandToTop(node: TreeNode, includeSelf = false): boolean {
    if (!node) {
      return false;
    }
    if (includeSelf) {
      if (this.treeControl.isExpandable(node)) {
        this.treeControl.expand(node);
        node.expanded = true;
      } else {
        return false;
      }
    }

    while (node != null) {
      node = node.parent;
      if (node) {
        if (this.treeControl.isExpandable(node)) {
          this.treeControl.expand(node);
          node.expanded = true;
        } else {
          return false;
        }
      }
    }

    return false;
  }
  collapseAll() {
    this.changeExpandedState(false);
  }
  expandAll() {
    this.changeExpandedState(true);
  }

  changeExpandedState(expectedExpanded: boolean): boolean {
    let changed = false;
    this.getAllNodes().forEach((node) => {
      if (
        this.treeControl.isExpandable(node) &&
        this.treeControl.isExpanded(node) !== expectedExpanded
      ) {
        changed = true;
        if (expectedExpanded) {
          this.treeControl.expand(node);
        } else {
          this.treeControl.collapse(node);
        }
      }
    });
    return changed;
  }
  getAllNodes(): TreeNode[] {
    if (this.flatDataSource && this.flatDataSource._flattenedData) {
      return this.flatDataSource._flattenedData.getValue();
    }
    return [];
  }

  setSelectedKeyframes(keyframe: Keyframe) {
    // this.selectedSubject.value.keyframe = keyframe;
    // this.selectedSubject.next(this.selectedSubject.value);
  }

  public get nodes(): Observable<TreeNode[]> {
    return this.nodesSubject.asObservable();
  }

  public parseDocumentOutline(document: InputDocument): TreeNode[] | null {
    const parser = this.appFactory.getParser(document.type);
    if (!parser) {
      throw new Error(
        `Cannot open document ${document.title}. Cannot find a parser for file.`
      );
    }

    document.parser = parser;
    // Parse application:
    let nodes = this.nodesSubject.value;
    nodes.length = 0;
    nodes = parser.parse(document) || [];
    return nodes;
  }

  update() {
    const items = this.nodesSubject.getValue();
    // Run new event to completely update the tree.
    this.setNodes(items);
  }
  setNodes(nodes: TreeNode[]) {
    this.flatDataSource.data = nodes;
    this.nodesSubject.next(nodes);
  }

  dispose() {
    this.flatDataSource.data = [];
  }
}
