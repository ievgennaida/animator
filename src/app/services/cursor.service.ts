import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { CursorType } from "../models/cursor-type";
import { HandleData } from "../models/handle-data";
import { Utils } from "./utils/utils";
import {
  AdornerPointType,
  AdornerTypeUtils,
} from "./viewport/adorners/adorner-type";

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
  public getCursorResize(deg: number | null): CursorType {
    return this.getHandleCursor(deg);
  }
  public getCursorRotate(deg: number | null): CursorType {
    return this.getHandleCursor(deg, true);
  }
  private getHandleCursor(deg: number | null, rotate = false) {
    if (deg === null) {
      return CursorType.Default;
    }
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
      handle.handle === AdornerPointType.None ||
      handle.handle === AdornerPointType.Center
    ) {
      this.setCursor(CursorType.Default);
    } else {
      let cursor = CursorType.Default;
      if (handle && handle.handle === AdornerPointType.CenterTransform) {
        cursor = CursorType.Move;
      } else if (handle && handle.handle === AdornerPointType.Translate) {
        cursor = CursorType.Move;
      } else {
        const screen = handle?.adorner?.screen;
        if (AdornerTypeUtils.isRotateAdornerType(handle.handle)) {
          cursor = this.getCursorRotate(
            this.getCursorAngle(
              handle,
              screen?.centerTransform || screen?.center,
              screenPoint
            )
          );
        } else if (AdornerTypeUtils.isScaleAdornerType(handle.handle)) {
          cursor = this.getCursorResize(
            this.getCursorAngle(handle, screen?.center, screenPoint)
          );
        }
      }

      this.setCursor(cursor);
    }
  }
  getCursorAngle(
    handle: HandleData,
    centerTransform: DOMPoint,
    screenPoint: DOMPoint
  ): number | null {
    if (!centerTransform || !screenPoint) {
      return null;
    }
    const deg = Utils.angle(screenPoint, centerTransform) + 180;
    return deg;
  }
}
