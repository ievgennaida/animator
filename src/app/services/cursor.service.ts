import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { CursorType } from "../models/cursor-type";
import { HandleData } from '../models/handle-data';
import { Utils } from "./utils/utils";
import { AdornerType } from "./viewport/adorners/adorner-type";

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
    const tolerance = 15;
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

  setHandleCursor(handle: HandleData, screenPoint: DOMPoint) {
    if (
      !handle ||
      !screenPoint ||
      handle.handles === AdornerType.None ||
      handle.handles === AdornerType.Center ||
      handle.handles === AdornerType.CenterTransform
    ) {
      this.setCursor(CursorType.Default);
    } else {
      const angle = this.getCursorAngle(handle, screenPoint);
      const cursor = handle.rotate
        ? this.getCursorRotate(angle)
        : this.getCursorResize(angle);

      this.setCursor(cursor);
    }
  }
  getCursorAngle(handle: HandleData, screenPoint: DOMPoint): number {
    const deg =
      Utils.angle(
        screenPoint,
        handle.adorner.center
      ) + 180;
    return deg;
  }
}
