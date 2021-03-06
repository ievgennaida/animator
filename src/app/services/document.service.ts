import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { PropertiesService } from "./properties.service";
import { PlayerService } from "./player.service";
import { InputDocument } from "../models/input-document";
import { AppFactory } from "./app-factory";
import { ViewService } from "./view.service";
import { LoggerService } from "./logger.service";
import { OutlineService } from "./outline.service";
import { SelectionService } from "./selection.service";

@Injectable({
  providedIn: "root",
})
export class DocumentService {
  /**
   * Active document subject
   */
  documentSubject = new BehaviorSubject<InputDocument | null>(null);
  constructor(
    private appFactory: AppFactory,
    private propertiesService: PropertiesService,
    private viewService: ViewService,
    private logger: LoggerService,
    private playerService: PlayerService,
    private selectionService: SelectionService,
    private outlineService: OutlineService
  ) {
    this.propertiesService.changed.subscribe((p) => {
      const doc = this.documentSubject.getValue();
      this.onDocumentChanged(doc, true);
    });
  }
  public getDocument(): InputDocument | null {
    const doc = this.documentSubject.getValue();
    return doc;
  }
  public setDocument(document: InputDocument, title: string) {
    this.onDocumentChanged(document);
  }

  onDocumentChanged(
    document: InputDocument | null,
    refresh: boolean = false
  ): void {
    const docTitle = document?.title || "unknown";
    if (!document || !this.viewService.playerHost) {
      console.log(
        "Cannot initialize null document. Player host should be initialized first."
      );
      return;
    }
    if (!this.viewService.isInit()) {
      this.logger.log(
        `Viewport is not ready to open the document: ${docTitle}.`
      );
      return;
    }

    const initializer = this.appFactory.getViewportInitializer(document.type);
    if (!initializer) {
      this.logger.log(
        `Cannot open document ${document?.title}. Cannot find a parser for file.`
      );
      return;
    }

    if (refresh && !initializer.initOnRefresh()) {
      return;
    }

    this.dispose(refresh);
    try {
      const data = initializer.initialize(
        document,
        this.viewService.playerHost
      );

      this.viewService.setViewportSize(data.size);
      this.playerService.setPlayer(data.player);
      if (!refresh) {
        const rootNodes = this.outlineService.parseDocumentOutline(document);
        if (!rootNodes) {
          return;
        }
        document.rootNode = rootNodes.find((p) => p.isRoot) || null;
        if (document.rootNode) {
          document.rootNode.expanded = true;
          this.outlineService.clear();
          this.outlineService.rootNode = document.rootNode;
          this.outlineService.setNodes(rootNodes);
          this.outlineService.syncExpandedState();
        }
      }

      this.documentSubject.next(document);
    } catch (err) {
      const message = `Document cannot be initializer ${document.title}.`;
      this.logger.log(message);
      this.dispose();
      this.documentSubject.next(null);
      // TODO: error view
      alert(message);
    }
  }

  dispose(refresh = false) {
    this.selectionService.deselectAll();
    if (!refresh) {
      this.outlineService.dispose();
      this.viewService.dispose();
    }
    this.playerService.dispose();
  }
}
