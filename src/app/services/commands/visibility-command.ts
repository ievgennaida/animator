import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import {
  BaseCommand,
  CommandType,
} from "src/app/services/commands/base-command";
import { VisibilityAction } from "../actions/visibility-action";
import { PropertiesService } from "../properties.service";
import { SelectionService } from "../selection.service";
import { UndoService } from "../undo.service";

/**
 * Command for the UI panels
 */
@Injectable({
  providedIn: "root",
})
export class VisibilityCommand implements BaseCommand {
  /**
   * Call to refresh command in the UI.
   * You should manually rise when can execute is changed.
   */
  changed = new Subject<BaseCommand>();
  tooltip = "Change visibility of the selected nodes";
  title = "Copy";
  icon = "visibility";
  hotkey = "";
  commandType = CommandType.command;
  iconSVG = false;
  constructor(
    private selectionService: SelectionService,
    private undoService: UndoService,
    private propertiesService: PropertiesService
  ) {
    this.selectionService.selectedSubject.subscribe(() => {
      this.resolveIconState();
      this.changed.next(this);
    });
  }
  resolveIconState() {
    const selected = this.selectionService.getSelected();
    const visible = selected.find((p) => this.propertiesService.isVisible(p));
    if (visible) {
      this.icon = "visibility";
    } else {
      this.icon = "visibility_off";
    }
  }
  canExecute(): boolean {
    const selected = this.selectionService.getSelected();
    if (selected && selected.length > 0) {
      return true;
    }

    return false;
  }
  execute(): void {
    if (!this.canExecute()) {
      return;
    }

    const selectedNodes = this.selectionService.getSelected();

    const action = this.undoService.getAction(VisibilityAction);
    action.init(selectedNodes);
    this.undoService.startAction(action, true);
    this.resolveIconState();
  }
}
