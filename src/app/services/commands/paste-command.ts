import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { PasteAction } from "../actions/paste-action";
import { DocumentService } from "../document.service";
import { PasteService } from "../paste.service";
import { SelectionService } from "../selection.service";
import { UndoService } from "../undo.service";

/**
 * Paste element command
 */
@Injectable({
  providedIn: "root",
})
export class PasteCommand implements BaseCommand {
  changed = new Subject<BaseCommand>();
  title = "Paste";
  icon = "content_paste";
  hotkey = "Ctrl+V";
  tooltip = `Paste selected items (${this.hotkey})`;
  iconSVG = false;
  constructor(
    private clipboardService: PasteService,
    private selectionService: SelectionService,
    private documentService: DocumentService,
    private undoService: UndoService
  ) {
    this.clipboardService.bufferSubject.subscribe(() =>
      this.changed.next(this)
    );
  }
  canExecute(): boolean {
    return this.clipboardService.bufferSubject.getValue().length > 0;
  }
  execute() {
    const activeDocument = this.documentService.getDocument();
    let toPasteContainer = activeDocument.rootNode;
    const selectedItems = this.selectionService.getSelected();
    if (selectedItems.length === 1) {
      if (activeDocument.parser.isContainer(selectedItems[0])) {
        toPasteContainer = selectedItems[0];
      } else if (
        activeDocument.parser.isContainer(selectedItems[0].parentNode)
      ) {
        toPasteContainer = selectedItems[0].parentNode;
      }
    }
    if (toPasteContainer) {
      this.undoService.executeAction(PasteAction, (action) => {
        const nodesToPaste = this.clipboardService.bufferSubject.getValue();
        action.init(toPasteContainer, nodesToPaste);
      });
    }
  }
}
