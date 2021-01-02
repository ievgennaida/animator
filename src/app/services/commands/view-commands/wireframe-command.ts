import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { OutlineService } from "../../outline.service";
import { ViewService } from "../../view.service";

const WireframeClassName = "wireframe";
/**
 * Command to remove matrix transform.
 * Untransform matrix and preserve position of all path data points.
 */
@Injectable({
  providedIn: "root",
})
export class WireframeCommand implements BaseCommand {
  constructor(
    private outline: OutlineService,
    private viewService: ViewService
  ) {
    outline.rootNodeSubject
      .asObservable()
      .subscribe(() => this.changed.next(this));
  }
  changed = new Subject<BaseCommand>();
  get active(): boolean {
    return this.viewService.playerHost.classList.contains(WireframeClassName);
  }
  set active(val: boolean) {
    if (this.active === val) {
      return;
    }
    if (!val) {
      this.viewService.playerHost.classList.remove(WireframeClassName);
    } else {
      this.viewService.playerHost.classList.add(WireframeClassName);
    }
  }
  tooltip = "Show current svg in wireframe mode.";
  title = "Wireframe";
  align = "right";
  icon: string | null = null;
  iconSVG = false;
  canExecute(): boolean {
    return this.outline.rootNode != null && this.viewService.playerHost != null;
  }
  execute() {
    if (!this.canExecute()) {
      return;
    }
    this.active = !this.active;
    if (this.active) {
      this.icon = "check";
    } else {
      this.icon = null;
    }
    this.changed.next(this);
  }
}
