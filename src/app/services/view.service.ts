import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { ViewMode } from "src/app/models/view-mode";
import { consts } from "src/environments/consts";
import { ICTMProvider } from "../models/interfaces/ctm-provider";
import { MatrixUtils } from "./utils/matrix-utils";
import { Utils } from "./utils/utils";
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
  ctm: DOMMatrix | null = null;
  screenCTM: DOMMatrix | null = null;
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
  viewportTransformedSubject = new BehaviorSubject<SVGElement | null>(null);
  viewportSubject = new BehaviorSubject<SVGGraphicsElement | null>(null);
  playerHost: SVGElement | null = null;
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
  setMode(mode: ViewMode): void {
    if (this.viewModeSubject.getValue() !== mode) {
      this.viewModeSubject.next(mode);
      this.emitViewportResized();
    }
  }
  toggleBreadcrumbs(): void {
    this.breadcrumbsVisibleSubject.next(
      !this.breadcrumbsVisibleSubject.getValue()
    );
  }
  toggleCode(): void {
    this.codeVisibleSubject.next(!this.codeVisibleSubject.getValue());
  }

  toggleMenu(): boolean {
    const value = !this.menuVisibleSubject.getValue();
    this.menuVisibleSubject.next(value);
    return value;
  }

  openMenu(): void {
    const value = this.menuVisibleSubject.getValue();
    if (!value) {
      this.menuVisibleSubject.next(true);
    }
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

  public emitViewportResized(): void {
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

  public get viewportInitialized(): Observable<SVGGraphicsElement | null> {
    return this.viewportSubject.asObservable();
  }

  public get viewport(): SVGGraphicsElement | null {
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
      console.log("Cannot set matrix, viewport is not ready yet");
      return;
    }
    if (this.viewport) {
      MatrixUtils.setMatrix(this.viewport, matrix);
      this.viewportTransformedSubject.next(this.viewport);
    } else {
      console.log("Cannot set matrix, viewport is not ready yet");
    }
  }

  public getZoom(): number {
    const ctm = this.getCTM();
    if (!ctm) {
      return 0;
    }
    return ctm.a;
  }

  public getScreenSize(): DOMPoint | null {
    if (!this.isInit()) {
      return null;
    }
    const svg = this.svgRoot();
    if (!svg) {
      return null;
    }
    const toPoint = svg.createSVGPoint();
    toPoint.x = svg.clientWidth;
    toPoint.y = svg.clientHeight;
    return toPoint;
  }
  public getDisplayedBounds(): DOMRect | null {
    if (!this.viewport) {
      return null;
    }
    const matrix = this.getCTM()?.inverse();
    const svg = this.svgRoot();
    const toPoint = this.getScreenSize()?.matrixTransform(matrix);
    const from = svg?.createSVGPoint().matrixTransform(matrix);
    if (from && toPoint) {
      return new DOMRect(
        from.x,
        from.y,
        toPoint.x - from.x,
        toPoint.y - from.y
      );
    } else {
      return null;
    }
  }

  /**
   * Get cached viewport CTM.
   */
  public getCTM(): DOMMatrix | null {
    if (!this.isInit()) {
      return null;
    }

    if (this.ctm) {
      return this.ctm;
    }

    return Utils.getCTM(this.viewport);
  }

  /**
   * Get viewport screen CTM.
   */
  public getScreenCTM(): DOMMatrix | null {
    if (!this.isInit()) {
      return null;
    }

    if (this.screenCTM) {
      return this.screenCTM;
    }

    const ctm = this.viewport?.getScreenCTM();
    this.screenCTM = ctm || null;
    return this.screenCTM;
  }

  public svgRoot(): SVGSVGElement | null {
    if (!this.isInit()) {
      return null;
    }
    if (this.viewport) {
      return this.viewport.ownerSVGElement;
    }
    return null;
  }

  getWorkAreaSize(): DOMRect {
    return this.viewportSize;
  }

  getContainerClientRect(): DOMRect | null {
    if (!this.isInit()) {
      return null;
    }
    const newRect = this.svgRoot()?.getBoundingClientRect();
    return newRect || null;
  }

  getContainerSize(): DOMRect | null {
    const svg = this.svgRoot();
    if (svg) {
      return new DOMRect(0, 0, svg.clientWidth, svg.clientHeight);
    } else {
      console.log(
        "Cannot get container size, service is not initialized and synced with DOM yet"
      );
      return null;
    }
  }

  /**
   * Called once on the application start.
   *
   * @param viewport svg application viewport.
   */
  init(viewport: SVGGraphicsElement | null, host: SVGElement | null) {
    this.playerHost = host;
    this.viewportSubject.next(viewport);
    this.emitViewportResized();
  }

  setViewportSize(rect: DOMRect) {
    this.viewportSizeSubject.next(rect);
  }

  dispose(): void {
    if (this.playerHost) {
      this.playerHost.innerHTML = "";
    }
    this.setViewportSize(this.defaultSize);
  }
}
