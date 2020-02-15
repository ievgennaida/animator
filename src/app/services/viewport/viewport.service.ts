import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject, Observable } from "rxjs";
import { MouseEventArgs } from "./MouseEventArgs";
import { consts } from "src/environments/consts";

@Injectable({
  providedIn: "root"
})
export class ViewportService {
  constructor() {}

  viewportTransformationSubject = new BehaviorSubject<DOMMatrix>(null);
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

  public getCTM(): DOMMatrix {
    if (!this.isInit()) {
      return null;
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
    element.transform.baseVal.initialize(transform);
    this.viewportTransformationSubject.next(matrix);
  }

  public getCTMForElement(element: SVGElement | any): DOMMatrix {
    return element.getCTM();
  }

  public toSvgPoint(x: number, y: number, translate = false): DOMPoint {
    if (!this.isInit()) {
      return null;
    }

    let point = this.convertSvgPoint(this.viewport, x, y);
    if (translate) {
      const matrix = this.getCTM();
      point = point.matrixTransform(matrix.inverse());
    }

    return point;
  }

  private convertSvgPoint(
    svg: SVGSVGElement | SVGElement,
    x: number,
    y: number
  ): DOMPoint {
    if (svg instanceof SVGElement) {
      svg = svg.ownerSVGElement;
    }

    const toReturn = (svg as SVGSVGElement).createSVGPoint();
    toReturn.x = x;
    toReturn.y = y;
    return toReturn;
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
    this.setViewportSize(this.defaultSize);
  }
}
