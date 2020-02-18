import { Injectable } from "@angular/core";
import { Subject, Observable, BehaviorSubject } from "rxjs";
import { TreeNode } from "../models/tree-node";

import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from "@angular/material/tree";
import { FlatTreeControl } from "@angular/cdk/tree";
import { SelectedData } from "../models/SelectedData";
import { Keyframe } from "../models/keyframes/Keyframe";
import { InputDocument } from "../models/input-document";
import { AppFactory } from "./app-factory";
import { LoggerService } from "./logger.service";

export enum InteractionSource {
  Outline,
  Adorners
}

@Injectable({
  providedIn: "root"
})
export class OutlineService {
  constructor(private appFactory: AppFactory, private logger: LoggerService) {}
  mouseOverSubject = new Subject<TreeNode>();
  nodesSubject = new BehaviorSubject<TreeNode[]>([]);
  selectedSubject = new BehaviorSubject<SelectedData>(new SelectedData());
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
      this.mouseOverSubject.next(node);
    }
  }

  // Allow to select tree node, but list of avaliable might be extended.
  setSelectedNode(
    node: TreeNode,
    isAdd: boolean = false,
    source: InteractionSource = InteractionSource.Adorners
  ) {
    const currentSelected = this.selectedSubject.getValue();
    currentSelected.changed.length = 0;
    if (isAdd) {
      if (currentSelected.nodes.includes(node)) {
        if (node.selected) {
          node.selected = false;
          currentSelected.changed.push(node);
        }

        this.deleteElement(currentSelected.nodes, node);
      } else {
        if (!node.selected) {
          node.selected = true;
          currentSelected.changed.push(node);
        }
      }
    } else {
      if (!node.selected) {
        node.selected = true;
        currentSelected.changed.push(node);
      }

      currentSelected.nodes.forEach(p => {
        if (p.selected) {
          p.selected = false;
          currentSelected.changed.push(p);
        }
      });

      currentSelected.nodes.length = 0;
    }

    if (node.selected) {
      currentSelected.nodes.push(node);
    }

    this.selectedSubject.next(currentSelected);
  }

  setSelectedKeyframes(keyframe: Keyframe) {
    // this.selectedSubject.value.keyframe = keyframe;
    // this.selectedSubject.next(this.selectedSubject.value);
  }

  public get mouseOver(): Observable<TreeNode> {
    return this.mouseOverSubject.asObservable();
  }

  public get selected(): Observable<SelectedData> {
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
    const currentSelection = this.selectedSubject.value;
    if (!currentSelection) {
      currentSelection.nodes.length = 0;
      currentSelection.keyframes.length = 0;
    }

    this.selectedSubject.next(currentSelection);
  }

  dispose() {
    this.flatDataSource.data = [];
  }
}
