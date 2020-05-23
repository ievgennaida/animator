import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject, Observable } from "rxjs";
import { consts } from "src/environments/consts";
import { Utils } from "./utils/utils";
import { ViewMode } from "src/app/models/view-mode";
import { ICTMProvider } from "../models/interfaces/ctm-provider";
export class ClientSize {
  prevClientWidth = 0;
  prevClientHeight = 0;
  clientWidth = 0;
  clientHeight = 0;
}
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

  /**
   * Player client bounds.
   */
  viewportResizedSubject = new BehaviorSubject<ClientSize>(new ClientSize());
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
  toggleBreadcrumbs() {
    this.breadcrumbsVisibleSubject.next(
      !this.breadcrumbsVisibleSubject.getValue()
    );
  }
  toggleCode() {
    this.codeVisibleSubject.next(!this.codeVisibleSubject.getValue());
  }

  toggleMenu() {
    this.menuVisibleSubject.next(!this.menuVisibleSubject.getValue());
  }

  /**
   * On viewport transformed.
   */
  public get transformed() {
    return this.viewportTransformedSubject.asObservable();
  }

  public get resized(): Observable<ClientSize> {
    return this.viewportResizedSubject.asObservable();
  }

  public emitViewportResized() {
    const area = this.viewportResizedSubject.getValue();
    const svg = this.svgRoot();
    if (svg) {
      if (
        svg.clientHeight !== area.clientHeight ||
        svg.clientWidth !== area.clientWidth
      ) {
        area.prevClientHeight = area.clientHeight;
        area.prevClientWidth = area.clientWidth;
        area.clientHeight = svg.clientHeight;
        area.clientWidth = svg.clientWidth;

        this.viewportResizedSubject.next(area);
      }
    } else {
      this.viewportResizedSubject.next(area);
    }
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
  public getDisplayedBounds(): DOMRect {
    if (!this.viewport) {
      return null;
    }
    const matrix = this.getCTM().inverse();
    const svg = this.svgRoot();
    const toPoint = this.getScreenSize().matrixTransform(matrix);
    const from = svg.createSVGPoint().matrixTransform(matrix);
    return new DOMRect(from.x, from.y, toPoint.x - from.x, toPoint.y - from.y);
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
    this.emitViewportResized();
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
