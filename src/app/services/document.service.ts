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

  documentSubject = new BehaviorSubject<InputDocument>(null);

  deleteElement(array, element) {
    const index: number = array.indexOf(element);
    if (index !== -1) {
      return array.splice(index, 1);
    }
    return array;
  }

  public get document(): Observable<InputDocument> {
    return this.documentSubject.asObservable();
  }

  public getDocument(): InputDocument {
    const doc = this.documentSubject.getValue();
    return doc;
  }
  public setDocument(document: InputDocument, title: string) {
    this.onDocumentChanged(document);
  }

  onDocumentChanged(document: InputDocument, refresh: boolean = false) {
    if (!this.viewService.isInit()) {
      this.logger.log(
        `Viewport is not ready to open the document: ${document.title}.`
      );
      return;
    }

    const initializer = this.appFactory.getViewportInitializer(document);
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
      const data = initializer.initialize(document, this.viewService.playerHost);

      this.viewService.setViewportSize(data.size);
      this.playerService.setPlayer(data.player);
      if (!refresh) {
        this.outlineService.parseDocumentOutline(document);
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
