import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject, Observable } from "rxjs";
import { consts } from "src/environments/consts";
import { Utils } from "./utils/utils";
import { ViewMode } from "src/environments/view-mode";
import { ICTMProvider } from "./interfaces/ctm-provider";

@Injectable({
  providedIn: "root",
})
export class ViewService implements ICTMProvider {
  constructor() {
    this.transformed.subscribe(() => {
      if (this.viewport) {
        // update self ctm cache
        this.ctm = Utils.getCTM(this.viewport);
        this.screenCTM = this.viewport.getScreenCTM();
      } else {
        this.ctm = null;
        this.screenCTM = null;
      }
    });
  }
  ctm: DOMMatrix;
  screenCTM: DOMMatrix;
  viewModeSubject = new BehaviorSubject<ViewMode>(
    consts.appearance.defaultMode
  );
  menuVisibleSubject = new BehaviorSubject<boolean>(
    consts.appearance.menuOpened
  );
  codeVisibleSubject = new BehaviorSubject<boolean>(false);
  breadcrumbsVisibleSubject = new BehaviorSubject<boolean>(
    consts.breadcrumbVisible
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
  setMode(mode: ViewMode) {
    if (this.viewModeSubject.getValue() !== mode) {
      this.viewModeSubject.next(mode);
      this.emitViewportResized();
    }
  }
  toogleBreadcrumbs() {
    this.breadcrumbsVisibleSubject.next(
      !this.breadcrumbsVisibleSubject.getValue()
    );
  }
  toogleCode() {
    this.codeVisibleSubject.next(!this.codeVisibleSubject.getValue());
  }

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

  public getScreenSize(): DOMPoint {
    if (!this.isInit()) {
      return null;
    }
    if (!this.svgRoot()) {
      return null;
    }
    const svg = this.svgRoot();
    const toPoint = svg.createSVGPoint();
    toPoint.x = svg.clientWidth;
    toPoint.y = svg.clientHeight;
    return toPoint;
  }
  public getDisplayedBounds() {
    if (!this.viewport) {
      return null;
    }
    const svg = this.svgRoot();
    const matrix = this.getCTM().inverse();
    let fromPoint = svg.createSVGPoint();
    fromPoint = fromPoint.matrixTransform(matrix);
    const toPoint = this.getScreenSize().matrixTransform(matrix);
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
  public getScreenCTM(): DOMMatrix {
    if (!this.isInit()) {
      return null;
    }

    if (this.screenCTM) {
      return this.screenCTM;
    }

    this.screenCTM = this.viewport.getScreenCTM();
  }

  public svgRoot(): SVGSVGElement {
    if (!this.isInit()) {
      return null;
    }

    return this.viewport.ownerSVGElement;
  }

  getWorkAreaSize(): DOMRect {
    return this.viewportSize;
  }

  getContainerClientRect(): DOMRect | any {
    if (!this.isInit()) {
      return;
    }
    return this.svgRoot().getBoundingClientRect();
  }

  getContainerSize(): DOMRect {
    if (!this.isInit()) {
      return;
    }
    const svg = this.svgRoot();
    return new DOMRect(0, 0, svg.clientWidth, svg.clientHeight);
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
