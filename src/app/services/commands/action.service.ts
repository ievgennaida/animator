import { Injectable } from "@angular/core";
import { Keyframe } from "src/app/models/keyframes/Keyframe";
import { BaseAction } from "./base-action";
import { UndoService } from "./undo.service";

@Injectable({
  providedIn: "root",
})
export class ActionService {
  constructor(private undoService: UndoService) {}

  action: BaseAction = null;
  /**
   * Start change keyframes
   * @param keyframes list of the keyframes.
   */
  StartTransaction(keyframes: Array<Keyframe>) {}

  Commit() {}
}
