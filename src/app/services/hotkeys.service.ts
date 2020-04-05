import { Injectable, Inject } from "@angular/core";
import { EventManager } from "@angular/platform-browser";
import { DOCUMENT } from "@angular/common";
import { OutlineService } from "./outline.service";
import { SelectionService } from './selection.service';

@Injectable({
  providedIn: "root",
})
export class HotkeysService {
  constructor(
    private eventManager: EventManager,
    private outlineService: OutlineService,
    private selectionService: SelectionService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  initialize() {
    this.eventManager.addEventListener(document.body, `keydown.control.a`, () => {
      this.selectionService.selectAll();
    });
  }
}
