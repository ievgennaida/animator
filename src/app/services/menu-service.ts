import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { PanelsIds } from "src/environments/consts";
import { ViewMode } from "../models/view-mode";
import { ConfigService } from "./config-service";
import { ViewService } from "./view.service";

export interface MenuPanel {
  expanded: boolean;
  visible: boolean;
  title: string;
  height: number;
  id: string | PanelsIds;
  allowClose?: boolean;
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
      const outline = menu.find((p) => p.id === PanelsIds.Outline);
      if (outline) {
        outline.visible = !animator;
        this.menuChanged.next(menu);
      }
    });
  }

  menuChanged = new BehaviorSubject<MenuPanel[]>(this.config.getPanelsConfig());

  getPanel(panelId: string | PanelsIds): MenuPanel | null {
    return this.getMenu().find((p) => p.id === panelId);
  }
  closePanel(panelId: string | PanelsIds) {
    this.setPanelVisibility(panelId, false);
  }

  setPanelVisibility(panelId: string | PanelsIds, visibility: boolean) {
    const panel = this.getPanel(panelId);
    if (panel) {
      if (panel.visible !== visibility) {
        panel.visible = visibility;
        this.config.save();
        // Rise event that panels updated:
        this.menuChanged.next(this.menuChanged.getValue());
      }
    }
  }
  isPanelVisible(panelId: PanelsIds): boolean {
    const visible = !!this.getVisibleMenu().find((p) => p.id === panelId);
    return visible;
  }
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
