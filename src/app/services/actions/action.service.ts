import { Injectable } from "@angular/core";
import { UndoService } from "./undo.service";

@Injectable({
  providedIn: "root"
})
export class ActionService {
  constructor(undoService: UndoService) {}
}
