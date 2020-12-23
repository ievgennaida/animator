import { Injectable } from "@angular/core";
import { consts, panelsConfig } from "src/environments/consts";
/**
 * Allow to get and save configuration for the user.
 */
@Injectable({
  providedIn: "root",
})
export class ConfigService {
  menuPanelSize = consts.appearance.menuPanelSize;
  /**
   * Get config saved for a user.
   */
  get(): typeof consts {
    return consts;
  }
  getPanelsConfig(): typeof panelsConfig {
    return panelsConfig;
  }
  save() {
    // TODO: save configuration:
  }
}
