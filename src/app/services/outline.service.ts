import { Injectable } from "@angular/core";
import { Subject, Observable, BehaviorSubject } from "rxjs";
import { TreeNode } from "../models/tree-node";

import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from "@angular/material/tree";
import { FlatTreeControl } from "@angular/cdk/tree";
import { PropertiesService } from "./properties.service";
import { Property } from "../models/Properties/Property";
import { Properties } from "../models/Properties/Properties";
import { AnimationTimelineKeyframe } from "animation-timeline-js";
import { PlayerService } from "./player.service";
import { AnimationItem } from "lottie-web";
import { SelectedData } from "../models/SelectedData";
import { Keyframe } from "../models/keyframes/Keyframe";
import { InputDocument } from "../models/input-document";
import { AppFactory } from "./app-factory";
import { ViewportService } from "./viewport/viewport.service";
import { LoggerService } from "./logger.service";
import { ToolsService } from "./viewport/tools.service";
import { CanvasAdornersRenderer } from "./viewport/renderers/canvas-adorners.renderer";
export enum InteractionSource {
  Outline,
  Adorners
}

@Injectable({
  providedIn: "root"
})
export class OutlineService {
  constructor(
    private appFactory: AppFactory,
    private logger: LoggerService
  ) {}

  nodesSubject = new BehaviorSubject<TreeNode[]>([]);
  selectedSubject = new BehaviorSubject<SelectedData>(new SelectedData());
  mouseOverSubject = new BehaviorSubject<SelectedData>(new SelectedData());
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

  // Allow to select tree node, but list of avaliable might be extended.
  setSelectedNode(
    node: TreeNode,
    isAdd: boolean = false,
    source: InteractionSource = InteractionSource.Adorners
  ) {
    const currentSelected = this.selectedSubject.getValue();
    if (isAdd) {
      if (currentSelected.nodes.includes(node)) {
        node.selected = false;
        this.deleteElement(currentSelected.nodes, node);
      } else {
        node.selected = true;
      }
    } else {
      node.selected = true;
      currentSelected.nodes.forEach(p => (p.selected = false));
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

  public get mouseOver(): Observable<SelectedData> {
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
