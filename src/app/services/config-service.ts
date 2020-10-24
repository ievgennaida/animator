import { Injectable } from "@angular/core";
import { consts } from "src/environments/consts";
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
  save() {
    // TODO: save configuration:
  }
}
