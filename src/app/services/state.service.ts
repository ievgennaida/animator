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

@Injectable({
  providedIn: "root"
})
export class StateService {
  constructor(
    private appFactory: AppFactory,
    private propertiesService: PropertiesService,
    private viewportService: ViewportService,
    private logger: LoggerService,
    private playerService: PlayerService,
    private toolsService: ToolsService
  ) {
    this.propertiesService.сhanged.subscribe(p => {
      const doc = this.documentSubject.getValue();
      this.onDocumentChanged(doc, true);
    });
  }

  documentSubject = new BehaviorSubject<InputDocument>(null);
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

  deleteElement(array, element) {
    const index: number = array.indexOf(element);
    if (index !== -1) {
      return array.splice(index, 1);
    }
    return array;
  }

  // Allow to select tree node, but list of avaliable might be extended.
  setSelectedNode(node: TreeNode, isAdd: boolean = false) {
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

  public get selected(): Observable<SelectedData> {
    return this.selectedSubject.asObservable();
  }
  public get nodes(): Observable<TreeNode[]> {
    return this.nodesSubject.asObservable();
  }

  public get document(): Observable<InputDocument> {
    return this.documentSubject.asObservable();
  }

  public setDocument(document: InputDocument, title: string) {
    this.onDocumentChanged(document);
  }

  onDocumentChanged(document: InputDocument, refresh: boolean = false) {
    if (!this.viewportService.isInit()) {
      this.logger.log(
        `Viewport is not ready to open the document: ${document.title}.`
      );
      return;
    }

    const initializer = this.appFactory.getViewportIntializer(document);
    if (!initializer) {
      this.logger.log(
        `Cannot open document ${document.title}. Cannot find a parser for file.`
      );
      return;
    }

    if (refresh && !initializer.initOnRefresh()) {
      return;
    }

    if (!document) {
      return;
    }

    this.dispose(refresh);
    try {
      const data = initializer.intialize(
        document,
        this.viewportService.playerHost
      );

      this.viewportService.setViewportSize(data.size);
      this.playerService.setPlayer(data.player);
      if (!refresh) {
        this.parseDocumentOutline(document);
      }

      this.toolsService.fitViewport();
      this.documentSubject.next(document);
    } catch (err) {
      const message = `Document cannot be initializer ${document.title}.`;
      this.logger.log(message);
      this.dispose();
      this.toolsService.fitViewport();
      this.documentSubject.next(null);
      // TODO: error view
      alert(message);
    }
  }

  dispose(refresh = false) {
    this.deselectAll();
    if (!refresh) {
      this.flatDataSource.data = [];
      this.viewportService.dispose();
    }
    this.playerService.dispose();
  }

  public deselectAll() {
    const currentSelection = this.selectedSubject.value;
    if (!currentSelection) {
      currentSelection.nodes.length = 0;
      currentSelection.keyframes.length = 0;
    }

    this.selectedSubject.next(currentSelection);
  }
}
