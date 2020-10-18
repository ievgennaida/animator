import { Injectable } from "@angular/core";
import { consts } from "src/environments/consts";
/**
 * Allow to get and save configuration for the user.
 */
@Injectable({
  providedIn: "root",
})
export class ConfigService {
  /**
   * Get config saved for a user.
   */
  get(): typeof consts {
    // TODO: save configuration:
    return consts;
  }
}
