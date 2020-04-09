import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject, Observable } from "rxjs";
import { consts } from "src/environments/consts";
import { Utils } from "./utils/utils";
@Injectable({
  providedIn: "root",
})
export class ViewService {
  constructor() {
    this.transformed.subscribe(() => {
      // update self ctm cache
      this.ctm = Utils.getCTM(this.viewport);
    });
  }
  ctm: DOMMatrix = null;
  menuVisibleSubject = new BehaviorSubject<boolean>(
    consts.appearance.menuOpened
  );
  viewportTransformedSubject = new BehaviorSubject<SVGElement>(null);
  viewportSubject = new BehaviorSubject<SVGGraphicsElement>(null);
  playerHost: SVGElement;
  defaultSize = new DOMRect(
    0,
    0,
    consts.defaultWorkArea.width,
    consts.defaultWorkArea.height
  );

  // Expected view port size:
  viewportSizeSubject = new BehaviorSubject<DOMRect | any>(this.defaultSize);

  viewportResizedSubject = new Subject();
  /**
   * On elements count of the svg is changed. deleted, added etc.
   */
  elementsChangedSubject = new Subject();

  toogleMenu() {
    this.menuVisibleSubject.next(!this.menuVisibleSubject.getValue());
  }

  /**
   * On viewport transformed.
   */
  public get transformed() {
    return this.viewportTransformedSubject.asObservable();
  }

  public get resized(): Observable<any> {
    return this.viewportResizedSubject.asObservable();
  }

  public emitViewportResized() {
    this.viewportResizedSubject.next();
  }

  public get elementsChanged(): Observable<any> {
    return this.elementsChangedSubject.asObservable();
  }

  public get viewportInitialized(): Observable<SVGGraphicsElement> {
    return this.viewportSubject.asObservable();
  }

  public get viewport(): SVGGraphicsElement {
    return this.viewportSubject.getValue();
  }

  public get viewportSize(): DOMRect {
    return this.viewportSizeSubject.getValue();
  }

  isInit(): boolean {
    return !!this.viewport;
  }

  /**
   * set viewport CTM
   */
  public setCTM(matrix: DOMMatrix) {
    if (!this.isInit()) {
      return;
    }

    Utils.setCTM(this.viewport, matrix);
    this.viewportTransformedSubject.next(this.viewport);
  }

  public getZoom(): number {
    const ctm = this.getCTM();
    if (!ctm) {
      return 0;
    }
    return ctm.a;
  }

  public getPan(): DOMPoint {
    const ctm = this.getCTM();
    if (!ctm) {
      return new DOMPoint();
    }
    return new DOMPoint(ctm.e, ctm.f);
  }

  public getDisplayedBounds() {
    if (!this.viewport) {
      return null;
    }
    const svg = this.viewport.ownerSVGElement;
    const matrix = this.getCTM().inverse();
    let fromPoint = svg.createSVGPoint();
    fromPoint = fromPoint.matrixTransform(matrix);

    let toPoint = svg.createSVGPoint();
    toPoint.x = svg.clientWidth;
    toPoint.y = svg.clientHeight;
    toPoint = toPoint.matrixTransform(matrix);

    return {
      from: fromPoint,
      to: toPoint,
    };
  }

  /**
   * Get cached viewport CTM.
   */
  public getCTM(): DOMMatrix {
    if (!this.isInit()) {
      return null;
    }

    if (this.ctm) {
      return this.ctm;
    }

    return Utils.getCTM(this.viewport);
  }

  public svgRoot(): SVGSVGElement {
    if (!this.isInit()) {
      return null;
    }

    return this.viewport.ownerSVGElement;
  }

  public toSvgPoint(x: number, y: number, translate = false): DOMPoint {
    if (!this.isInit()) {
      return null;
    }

    let point = Utils.getDOMPoint(x, y);
    if (translate) {
      const matrix = this.getCTM();
      point = point.matrixTransform(matrix.inverse());
    }

    return point;
  }

  getWorkAreaSize(): DOMRect {
    return this.viewportSize;
  }

  getContainerClientRect(): DOMRect | any {
    if (!this.isInit()) {
      return;
    }
    return this.viewport.ownerSVGElement.getBoundingClientRect();
  }

  getContainerSize(): DOMRect {
    if (!this.isInit()) {
      return;
    }
    const parent = this.viewport.ownerSVGElement;
    return new DOMRect(0, 0, parent.clientWidth, parent.clientHeight);
  }

  /**
   * Called once on the application start.
   * @param viewport svg application viewport.
   */
  init(viewport: SVGGraphicsElement, host: SVGElement) {
    this.playerHost = host;
    this.viewportSubject.next(viewport);
  }

  setViewportSize(rect: DOMRect) {
    this.viewportSizeSubject.next(rect);
  }

  dispose() {
    if (this.playerHost) {
      this.playerHost.innerHTML = "";
    }
    this.setViewportSize(this.defaultSize);
  }
}
