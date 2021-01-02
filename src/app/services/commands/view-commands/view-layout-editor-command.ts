import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ViewMode } from "src/app/models/view-mode";
import { BaseCommand } from "src/app/services/commands/base-command";
import { ViewService } from "../../view.service";

/**
 * Command to remove matrix transform.
 * Untransform matrix and preserve position of all path data points.
 */
@Injectable({
  providedIn: "root",
})
export class ViewLayoutEditorCommand implements BaseCommand {
  constructor(private viewService: ViewService) {
    this.viewService.viewModeSubject.asObservable().subscribe(() => {
      this.resolveIconState();
      this.changed.next(this);
    });
  }
  changed = new Subject<BaseCommand>();

  tooltip = "Show current svg in Editor mode.";
  title = "Editor";
  align = "right";
  icon: string | null = null;
  iconSVG = false;
  canExecute(): boolean {
    return true;
  }
  execute() {
    if (!this.canExecute()) {
      return;
    }
    this.resolveIconState();
    this.viewService.setMode(ViewMode.Editor);
    this.changed.next(this);
  }

  resolveIconState() {
    if (this.viewService.getMode() === ViewMode.Editor) {
      this.icon = "check";
    } else {
      this.icon = null;
    }
  }
}
