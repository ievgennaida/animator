import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject, Observable } from "rxjs";
import { consts } from "src/environments/consts";

@Injectable({
  providedIn: "root"
})
export class ViewportService {
  constructor() {
    this.transformed.subscribe(() => {
      this.ctm = this.getCTMForElement(this.viewport);
    });
  }

  ctm: DOMMatrix = null;
  viewportTransformationSubject = new BehaviorSubject(null);
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
  public get transformed(){
    return this.viewportTransformationSubject
      .asObservable();
  }
  /**
   * On elements count of the svg is changed. deleted, added etc.
   */
  elementsChangedSubject = new Subject();

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

  public get viewportResize(): Observable<any> {
    return this.viewportResizedSubject.asObservable();
  }

  public emitViewportResized() {
    this.viewportResizedSubject.next();
    this.onViewportResize();
  }

  isInit(): boolean {
    return !!this.viewport;
  }

  public setCTM(matrix: DOMMatrix) {
    if (!this.isInit()) {
      return;
    }

    this.setCTMForElement(this.viewport, matrix);
  }

  public getZoom(): number {
    const ctm = this.getCTM();
    return ctm.a;
  }

  public getPan() {
    const ctm = this.getCTM();
    return { x: ctm.e, y: ctm.f };
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
      to: toPoint
    };
  }

  public matrixRectTransform(rect: DOMRect, matrix: DOMMatrix): DOMRect {
    const start = new DOMPoint(rect.x, rect.y).matrixTransform(matrix);
    const end = new DOMPoint(
      rect.x + rect.width,
      rect.y + rect.height
    ).matrixTransform(matrix);

    return new DOMRect(start.x, start.y, end.x - start.x, end.y - start.y);
  }

  public getCTM(): DOMMatrix {
    if (!this.isInit()) {
      return null;
    }

    if (this.ctm) {
      return this.ctm;
    }

    return this.getCTMForElement(this.viewport);
  }

  public svgRoot(): SVGSVGElement {
    if (!this.isInit()) {
      return null;
    }

    return this.viewport.ownerSVGElement;
  }

  public setCTMForElement(element: SVGElement | any, matrix: DOMMatrix) {
    const transform = element.ownerSVGElement.createSVGTransform();
    transform.setMatrix(matrix);
    this.setTransformElement(element, transform);
  }

  public setTransformElement(element: SVGElement | any, tranform: SVGTransform ) {
    element.transform.baseVal.initialize(tranform);
    this.viewportTransformationSubject.next(tranform);
  }

  public getCTMForElement(element: SVGElement | any): DOMMatrix {
    if (!element) {
      return null;
    }
    return element.getCTM();
  }

  public toSvgPoint(x: number, y: number, translate = false): DOMPoint {
    if (!this.isInit()) {
      return null;
    }

    let point = this.convertSvgPoint(x, y);
    if (translate) {
      const matrix = this.getCTM();
      point = point.matrixTransform(matrix.inverse());
    }

    return point;
  }

  private convertSvgPoint(x: number, y: number): DOMPoint {
    return new DOMPoint(x, y);
  }

  onViewportResize() {
    if (!this.viewportSize) {
      // this.viewportSize = this.viewport.getBBox();
    }
  }

  getWorkAreaSize(): DOMRect {
    this.onViewportResize();
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
    this.viewportSubject.next(viewport);
    this.playerHost = host;
  }

  setViewportSize(rect: DOMRect) {
    this.viewportSizeSubject.next(rect);
    this.onViewportResize();
  }

  dispose() {
    if (this.playerHost) {
      this.playerHost.innerHTML = "";
    }
    this.setViewportSize(this.defaultSize);
  }
}
