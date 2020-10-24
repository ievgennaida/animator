import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { consts, defaultMenu } from "src/environments/consts";
import { ViewMode } from "../models/view-mode";
import { ConfigService } from "./config-service";
import { ViewService } from "./view.service";

export interface MenuPanel {
  expanded: boolean;
  visible: boolean;
  title: string;
  height: number;
  id: string;
}

/**
 * Menu manager
 */
@Injectable({
  providedIn: "root",
})
export class MenuService {
  constructor(private config: ConfigService, private viewService: ViewService) {
    this.viewService.viewModeSubject.asObservable().subscribe((mode) => {
      const animator = mode === ViewMode.Animator;
      const menu = this.getMenu();
      const outline = menu.find((p) => p.id === "outline");
      if (outline) {
        outline.visible = !animator;
        this.menuChanged.next(menu);
      }
    });
  }

  menuChanged = new BehaviorSubject<MenuPanel[]>(defaultMenu);
  getMenu(): MenuPanel[] {
    return this.menuChanged.getValue();
  }
  saveMenuSettings() {
    // TODO: size of the menu should be saved. current collection can be used already.
  }
  getVisibleMenu(): MenuPanel[] {
    return this.getMenu().filter((p) => p.visible);
  }
}
