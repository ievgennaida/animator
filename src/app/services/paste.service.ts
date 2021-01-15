import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { TreeNode } from "../models/tree-node";
import { DocumentService } from "./document.service";

@Injectable({
  providedIn: "root",
})
export class PasteService {
  constructor(private documentService: DocumentService) {}
  bufferSubject = new BehaviorSubject<TreeNode[]>([]);
  cut() {}
  copy(items: TreeNode[]) {
    this.addToBuffer(items);
  }
  addToBuffer(items: TreeNode[]) {
    const parser = this.documentService.getDocument()?.parser;
    if (!parser) {
      return;
    }
    // Clone when added to buffer to make a snapshot.
    // Also we should clone when pasted.
    items = items.map((p) => parser.clone(p, true));
    this.bufferSubject.next([...items]);
  }
  paste() {}
}
