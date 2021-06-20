import { Injectable } from "@angular/core";
import { merge, Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { DocumentService } from "../document.service";
import { PasteService } from "../paste.service";
import { SelectionService } from "../selection.service";

/**
 * copy element command
 */
@Injectable({
  providedIn: "root",
})
export class CopyCommand implements BaseCommand {
  changed = new Subject<BaseCommand>();
  title = "Copy";
  icon = "file_copy";
  hotkey = "Ctrl+C";
  tooltip = `Copy selected items (${this.hotkey})`;
  iconSVG = false;
  constructor(
    private selectionService: SelectionService,
    private clipboardService: PasteService,
    private documentService: DocumentService
  ) {
    merge(
      this.documentService.documentSubject,
      this.selectionService.selectedSubject
    ).subscribe(() => this.changed.next(this));
  }
  canExecute(): boolean {
    const selected = this.selectionService.getTopSelectedNodes();
    if (selected && selected.length > 0) {
      const root = this.documentService?.getDocument()?.rootNode;
      if (!root) {
        return false;
      }
      // Don't allow to copy root nodes
      return !selected.includes(root);
    }

    return false;
  }
  execute(): void {
    const selectedNodes = this.selectionService.getTopSelectedNodes();
    this.clipboardService.addToBuffer(selectedNodes);
  }
}
