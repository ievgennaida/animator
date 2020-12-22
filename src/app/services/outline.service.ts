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
  constructor(private appFactory: AppFactory, private logger: LoggerService) {}

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

  setNodes(nodes: TreeNode[]) {
    this.flatDataSource.data = nodes;
    nodes.forEach((p) => {
      if (p.expandable && p.expanded) {
        this.treeControl.expand(p);
      } else {
        this.treeControl.collapse(p);
      }
      p.expanded = this.treeControl.isExpanded(p);
    });
    this.nodesSubject.next(nodes);
  }

  dispose() {
    this.flatDataSource.data = [];
  }
}
