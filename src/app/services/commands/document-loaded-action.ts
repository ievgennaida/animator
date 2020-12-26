import { Injectable } from "@angular/core";
import { BaseAction } from "./base-action";

/**
 * Represents first node in the undo service.
 */
@Injectable({
  providedIn: "root",
})
export class DocumentLoadedAction extends BaseAction {
  constructor() {
    super();
  }
  title = "Document";
  icon = "assignment";
  canUndo(): boolean {
    // Document cannot be unloaded.
    return false;
  }
  do() {}
  undo() {}
}
