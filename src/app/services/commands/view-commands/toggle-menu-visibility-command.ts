import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { ViewService } from "../../view.service";

/**
 * Command to remove matrix transform.
 * Untransform matrix and preserve position of all path data points.
 */
@Injectable({
  providedIn: "root",
})
export class ToggleMenuVisibilityCommand implements BaseCommand {
  constructor(private viewService: ViewService) {
    this.viewService.viewModeSubject.asObservable().subscribe(() => {    
      this.resolveIconState();
      this.changed.next(this);
    });
  }
  changed = new Subject<BaseCommand>();

  tooltip = "Menu";
  title = "Menu";
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
    this.changed.next(this);
  }
  
  resolveIconState() {
    const visible = this.viewService.menuVisibleSubject.getValue();
    if (!visible) {
      this.viewService.openMenu();
      //fix this.viewService.toggleMenu();
      this.icon = "check";
    }
    else
    {
      this.icon = "null";
    }   
  }
}
