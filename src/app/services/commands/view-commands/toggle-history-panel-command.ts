import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { ViewService } from "../../view.service";
import { MenuService } from "src/app/services/menu-service";
import { PanelsIds } from "src/environments/consts";

/**
 * Command to remove matrix transform.
 * Untransform matrix and preserve position of all path data points.
 */
@Injectable({
  providedIn: "root",
})
export class ToggleHistoryPanelCommand implements BaseCommand {
  constructor(private viewService: ViewService,  private menuService: MenuService) {
    this.viewService.viewModeSubject.asObservable().subscribe(() => {
      this.togglePanel(PanelsIds.History);  
      this.changed.next(this);
    });   
  }
  changed = new Subject<BaseCommand>();

  tooltip = "History";
  title = "History";
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
    
    this.togglePanel(PanelsIds.History);
    this.changed.next(this);
  }
  
  togglePanel(panelId: PanelsIds): boolean {
    const visible = this.menuService.isPanelVisible(panelId);
    if (!visible) {
      this.viewService.openMenu();
      this.icon = "check";
    }
    else
    {
      this.icon = "null";
    }
    this.menuService.setPanelVisibility(panelId, !visible);
    return !visible;
  }
}
