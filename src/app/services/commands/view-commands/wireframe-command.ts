import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { OutlineService } from "../../outline.service";
import { ViewService } from "../../view.service";

const WIREFRAME_CLASS = "wireframe";
/**
 * Command to remove matrix transform.
 * Untransform matrix and preserve position of all path data points.
 */
@Injectable({
  providedIn: "root",
})
export class WireframeCommand implements BaseCommand {
  changed = new Subject<BaseCommand>();
  get active(): boolean {
    return !!this.viewService?.playerHost?.classList.contains(WIREFRAME_CLASS);
  }
  set active(val: boolean) {
    if (this.active === val) {
      return;
    }
    const host = this.viewService?.playerHost;
    if (!host) {
      return;
    }
    if (!val) {
      host.classList.remove(WIREFRAME_CLASS);
    } else {
      host.classList.add(WIREFRAME_CLASS);
    }
  }
  tooltip = "Show current svg in wireframe mode.";
  title = "Wireframe";
  align = "right";
  icon: string | null = null;
  iconSVG = false;
  constructor(
    private outline: OutlineService,
    private viewService: ViewService
  ) {
    outline.rootNodeSubject
      .asObservable()
      .subscribe(() => this.changed.next(this));
  }
  canExecute(): boolean {
    return this.outline.rootNode != null && this.viewService.playerHost != null;
  }
  execute(): void {
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
