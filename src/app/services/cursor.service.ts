import { Observable, BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";
import { Utils } from "./utils/utils";
import { AdornerData } from "./viewport/adorners/adorner-data";
import { AdornerType, AdornerTypeUtils } from './viewport/adorners/adorner-type';
import { CursorType } from '../models/cursor-type';

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
  public getCursorResize(
    adornersData: AdornerData,
    adornerType: AdornerType
  ): CursorType {
    if (
      adornerType === AdornerType.Center ||
      adornerType === AdornerType.CenterTransform
    ) {
      return CursorType.Default;
    }
    const point = adornersData.get(adornerType);
    if (!point) {
      return CursorType.Default;
    }
    const deg = Utils.angle(point, adornersData.center) + 180;
    if ((deg >= 0 && deg <= 20) || (deg >= 340 && deg <= 360)) {
      return CursorType.WResize;
    } else if (deg >= 20 && deg <= 60) {
      return CursorType.SWResize;
    } else if (deg >= 60 && deg <= 120) {
      return CursorType.NResize;
    } else if (deg >= 120 && deg <= 160) {
      return CursorType.SEResize;
    } else if (deg >= 160 && deg <= 200) {
      return CursorType.EResize;
    } else if (deg >= 200 && deg <= 240) {
      return CursorType.NEResize;
    } else if (deg >= 240 && deg <= 300) {
      return CursorType.SResize;
    } else if (deg >= 300 && deg <= 340) {
      return CursorType.NWResize;
    }
  }
  public getCursorRotate(
    adornersData: AdornerData,
    adornerType: AdornerType
  ): CursorType {
    const point = adornersData.get(AdornerTypeUtils.toMoveAdornerType(adornerType));
    if (!point) {
      return CursorType.Default;
    }
    const deg = Utils.angle(point, adornersData.center) + 180;
    if ((deg >= 0 && deg <= 20) || (deg >= 340 && deg <= 360)) {
      return CursorType.RotateRC;
    } else if (deg >= 20 && deg <= 60) {
      return CursorType.RotateTR;
    } else if (deg >= 60 && deg <= 120) {
      return CursorType.RotateTC;
    } else if (deg >= 120 && deg <= 160) {
      return CursorType.RotateTL;
    } else if (deg >= 160 && deg <= 200) {
      return CursorType.RotateLC;
    } else if (deg >= 200 && deg <= 240) {
      return CursorType.RotateBL;
    } else if (deg >= 240 && deg <= 300) {
      return CursorType.RotateBC;
    } else if (deg >= 300 && deg <= 340) {
      return CursorType.RotateBR;
    }
  }
}
