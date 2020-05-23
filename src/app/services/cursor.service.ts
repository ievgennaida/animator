import { Observable, BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";
import { Utils } from "./utils/utils";
import { AdornerData } from "./viewport/adorners/adorner-data";
import {
  AdornerType,
  AdornerTypeUtils,
} from "./viewport/adorners/adorner-type";
import { CursorType } from "../models/cursor-type";

@Injectable({
  providedIn: "root",
})
export class CursorService {
  cursorSubject = new BehaviorSubject<CursorType>(CursorType.Default);
  public get changed(): Observable<CursorType> {
    return this.cursorSubject.asObservable();
  }

  public setCursor(cursor: CursorType) {
    if (cursor !== this.cursorSubject.getValue()) {
      console.log('set:'+ cursor);
      this.cursorSubject.next(cursor);
    }
  }
  public getCursorResize(deg: number): CursorType {
    return this.getHandleCursor(deg);
  }
  public getCursorRotate(deg: number): CursorType {
    return this.getHandleCursor(deg, true);
  }
  private getHandleCursor(deg: number, rotate = false) {
    const tolerance = 10;
    if (
      (deg >= 0 && deg <= 0 + tolerance) ||
      (deg >= 360 - tolerance && deg <= 360)
    ) {
      return rotate ? CursorType.RotateRC : CursorType.WResize;
    } else if (deg >= 0 + tolerance && deg <= 90 - tolerance) {
      return rotate ? CursorType.RotateTR : CursorType.SWResize;
    } else if (deg >= 90 - tolerance && deg <= 90 + tolerance) {
      return rotate ? CursorType.RotateTC : CursorType.NResize;
    } else if (deg >= 90 + tolerance && deg <= 180 - tolerance) {
      return rotate ? CursorType.RotateTL : CursorType.SEResize;
    } else if (deg >= 180 - tolerance && deg <= 180 + tolerance) {
      return rotate ? CursorType.RotateLC : CursorType.EResize;
    } else if (deg >= 180 + tolerance && deg <= 270 - tolerance) {
      return rotate ? CursorType.RotateBL : CursorType.NEResize;
    } else if (deg >= 270 - tolerance && deg <= 270 + tolerance) {
      return rotate ? CursorType.RotateBC : CursorType.SResize;
    } else if (deg >= 270 + tolerance && deg <= 360 - tolerance) {
      return rotate ? CursorType.RotateBR : CursorType.NWResize;
    }
  }
}
