import { Injectable } from "@angular/core";
import { UndoService } from "./undo.service";
import { Keyframe } from 'src/app/models/keyframes/Keyframe';
import { ChangeValue } from './ChangeValue';
import { BaseAction } from './BaseAction';

@Injectable({
  providedIn: "root"
})
export class ActionService {
  constructor(private undoService: UndoService) {

  }

  action:BaseAction = null;
  /**
   * Start change keyframes
   * @param keyframes
   */
  StartTransaction(keyframes: Array<Keyframe>) {
    const changeValue = new ChangeValue();
    changeValue.keyframes = keyframes;
    this.undoService.addAction(changeValue);
    this.action = changeValue;
  }

  Commit() {

  }
}
