import { Injectable } from "@angular/core";
import { BaseAction } from "./base-action";

/**
 * Represents first node in the undo service.
 */
@Injectable({
  providedIn: "root",
})
export class DocumentLoadedAction extends BaseAction {

  title = "Document";
  icon = "assignment";
  committed = true;
  constructor() {
    super();
  }
  execute() {}
  canUndo(): boolean {
    // Document cannot be unloaded.
    return false;
  }
  canExecute(): boolean {
    return false;
  }
  undo() {}
}
