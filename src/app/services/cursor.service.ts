import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { AdornerPointType } from "../models/adorner-point-type";
import { AdornerTypeUtils } from "../models/adorner-type-utils";
import { CursorType } from "../models/cursor-type";
import { HandleData } from "../models/handle-data";
import { Utils } from "./utils/utils";

@Injectable({
  providedIn: "root",
})
export class CursorService {
  /**
   * Default cursor.
   */
  defaultCursorSubject = new BehaviorSubject<CursorType>(CursorType.default);
  /**
   * Current active cursor.
   */
  cursorSubject = new BehaviorSubject<CursorType>(
    this.defaultCursorSubject.getValue()
  );
  public get changed(): Observable<CursorType> {
    return this.cursorSubject.asObservable();
  }

  public setDefaultCursor(cursor: CursorType, applyToActiveCursor = true) {
    if (cursor !== this.defaultCursorSubject.getValue()) {
      this.defaultCursorSubject.next(cursor);
    }
    if (applyToActiveCursor) {
      this.setCursor(cursor);
    }
  }
  public applyDefault() {
    this.setCursor(this.defaultCursorSubject.getValue());
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

  setHandleCursor(
    handle: HandleData | null,
    screenPoint: DOMPoint | null
  ): void {
    const defaultCursor = this.defaultCursorSubject.getValue();
    if (
      !handle ||
      !screenPoint ||
      handle.handle === AdornerPointType.none ||
      handle.handle === AdornerPointType.center
    ) {
      this.setCursor(defaultCursor);
    } else {
      let cursor = defaultCursor;
      if (handle && handle.handle === AdornerPointType.centerTransform) {
        cursor = CursorType.move;
      } else if (handle && handle.handle === AdornerPointType.translate) {
        cursor = CursorType.move;
      } else {
        const screen = handle?.adorner?.screen;
        if (AdornerTypeUtils.isRotateAdornerType(handle.handle)) {
          cursor = this.getCursorRotate(
            this.getCursorAngle(
              handle,
              screen?.centerTransform || screen?.center || null,
              screenPoint
            )
          );
        } else if (AdornerTypeUtils.isScaleAdornerType(handle.handle)) {
          cursor = this.getCursorResize(
            this.getCursorAngle(handle, screen?.center || null, screenPoint)
          );
        }
      }

      this.setCursor(cursor);
    }
  }
  getCursorAngle(
    handle: HandleData,
    centerTransform: DOMPoint | null,
    screenPoint: DOMPoint | null
  ): number | null {
    if (!centerTransform || !screenPoint) {
      return null;
    }
    const deg = Utils.angle(screenPoint, centerTransform) + 180;
    return deg;
  }
  private getHandleCursor(deg: number | null, rotate = false): CursorType {
    if (deg === null) {
      return this.defaultCursorSubject.getValue();
    }
    const tolerance = 15;
    if (
      (deg >= 0 && deg <= 0 + tolerance) ||
      (deg >= 360 - tolerance && deg <= 360)
    ) {
      return rotate ? CursorType.rotateRC : CursorType.wResize;
    } else if (deg >= 0 + tolerance && deg <= 90 - tolerance) {
      return rotate ? CursorType.rotateTR : CursorType.sWResize;
    } else if (deg >= 90 - tolerance && deg <= 90 + tolerance) {
      return rotate ? CursorType.rotateTC : CursorType.nResize;
    } else if (deg >= 90 + tolerance && deg <= 180 - tolerance) {
      return rotate ? CursorType.rotateTL : CursorType.sEResize;
    } else if (deg >= 180 - tolerance && deg <= 180 + tolerance) {
      return rotate ? CursorType.rotateLC : CursorType.eResize;
    } else if (deg >= 180 + tolerance && deg <= 270 - tolerance) {
      return rotate ? CursorType.rotateBL : CursorType.nEResize;
    } else if (deg >= 270 - tolerance && deg <= 270 + tolerance) {
      return rotate ? CursorType.rotateBC : CursorType.sResize;
    } else if (deg >= 270 + tolerance && deg <= 360 - tolerance) {
      return rotate ? CursorType.rotateBR : CursorType.nWResize;
    }

    return CursorType.default;
  }
}
