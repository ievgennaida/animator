import { Subject, Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class CursorService {
  cursorSubject = new Subject<CursorType>();
  public get сhanged(): Observable<CursorType> {
    return this.cursorSubject.asObservable();
  }

  public setCursor(cursor: CursorType) {
    this.cursorSubject.next(cursor);
  }
}

export enum CursorType {
  Alias = "alias",
  AllAcroll = "all-scroll",
  Auto = "auto",
  Cell = "cell",
  ContextMenu = "context-menu",
  ColResize = "col-resize",
  Copy = "copy",
  Crosshair = "crosshair",
  Default = "default",
  EResize = "e-resize",
  EWResize = "ew-resize",
  Grab = "grab",
  Grabbing = "grabbing",
  Help = "help",
  Move = "move",
  NResize = "n-resize",
  NEResize = "ne-resize",
  NESWResize = "nesw-resize",
  NSResize = "ns-resize",
  NWResize = "nw-resize",
  NWSEResize = "nwse-resize",
  NoDrop = "no-drop",
  None = "none",
  NotAllowed = "not-allowed",
  Pointer = "pointer",
  Progress = "progress",
  RowResize = "row-resize",
  SResize = "s-resize",
  SEResize = "se-resize",
  SWResize = "sw-resize",
  Text = "text",
  WResize = "w-resize",
  Wait = "wait",
  ZoomIn = "zoom-in",
  ZoomOut = "zoom-out"
}
