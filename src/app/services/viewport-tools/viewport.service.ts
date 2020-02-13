import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject, Observable } from "rxjs";
import { MouseEventArgs } from "./MouseEventArgs";

@Injectable({
  providedIn: "root"
})
export class ViewportService {
  constructor() {}
  public viewport: SVGGraphicsElement = null;

  workAreaRect: DOMRect = null;
  viewportTransformationSubject = new BehaviorSubject<DOMMatrix>(null);
  viewportResizedSubject = new Subject();

  public get viewportResize(): Observable<any> {
    return this.viewportResizedSubject.asObservable();
  }

  public onViewportResized() {
    this.viewportResizedSubject.next();
  }

  isInit() {
    return !!this.viewport;
  }

  public setCTM(matrix: DOMMatrix) {
    if (!this.isInit()) {
      return;
    }

    this.setCTMForElement(this.viewport, matrix);
  }

  public getZoom() {
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

  public setCTMForElement(element: SVGElement | any, matrix: DOMMatrix) {
    const transform = element.ownerSVGElement.createSVGTransform();
    transform.setMatrix(matrix);
    element.transform.baseVal.initialize(transform);
    this.viewportTransformationSubject.next(matrix);
  }

  public getCTMForElement(element: SVGElement | any): DOMMatrix {
    return element.getCTM();
  }

  public toSvgPoint(x: number, y: number, translate = false) {
    if (!this.isInit()) {
      return;
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
  ) {
    if (svg instanceof SVGElement) svg = svg.ownerSVGElement;
    const toReturn = (svg as SVGSVGElement).createSVGPoint();
    toReturn.x = x;
    toReturn.y = y;
    return toReturn;
  }

  onViewportResize() {
    if (!this.workAreaRect) {
      this.workAreaRect = this.viewport.getBBox();
    }
  }

  getWorkAreaSize(): DOMRect {
    this.onViewportResize();
    return this.workAreaRect;
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
  onViewportInit(
    viewport: SVGGraphicsElement,
    workAreaRect: DOMRect = null
  ) {
    this.viewport = viewport;
    if (viewport) {
      this.workAreaRect = workAreaRect;
      this.onViewportResize();
    }
  }
}
