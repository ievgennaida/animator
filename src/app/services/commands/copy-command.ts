import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
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
  constructor(
    private selectionService: SelectionService,
    private clipboardService: PasteService,
    private documentService: DocumentService
  ) {
    this.selectionService.selected.subscribe(() => this.changed.next(this));
  }
  changed = new Subject<BaseCommand>();
  title = "Copy";
  icon = "file_copy";
  hotkey = "Ctrl+C";
  tooltip = `Copy selected items (${this.hotkey})`;
  iconSVG = false;
  canExecute(): boolean {
    const selected = this.selectionService.getTopSelectedNodes();
    if (selected && selected.length > 0) {
      // Don't allow to copy root nodes
      return !selected.includes(this.documentService.getDocument().rootNode);
    }

    return false;
  }
  execute() {
    const selectedNodes = this.selectionService.getTopSelectedNodes();
    this.clipboardService.addToBuffer(selectedNodes);
  }
}
