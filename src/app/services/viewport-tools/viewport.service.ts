import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { MouseEventArgs } from "./MouseEventArgs";

@Injectable({
  providedIn: "root"
})
export class ViewportService {
  constructor() {}
  public viewport: SVGGraphicsElement = null;
  // Predefined viewport height.
  viewportHeight = 0;
  viewportWidth = 0;
  viewportTransformationSubject = new Subject();
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

  public getZoom(){
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

  public toSvgPoint(x:number, y:number, translate = false) {
    if (!this.isInit()) {
      return;
    }

    let point = this.convertSvgPoint(
      this.viewport,
      x,
      y
    );
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
    if (!this.viewportHeight || !this.viewportWidth) {
      const size = this.viewport.getBBox();
      this.viewportHeight = size.height;
      this.viewportWidth = size.width;
    }
  }

  getWorkAreaSize(): DOMRect {
    this.onViewportResize();
    return new DOMRect(0, 0, this.viewportWidth, this.viewportHeight);
  }

  getContainerClientRect(): DOMRect|any{
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
    viewportWidth = 0,
    viewportHeight = 0
  ) {
    this.viewport = viewport;
    if (viewport) {
      this.viewportHeight = viewportHeight;
      this.viewportWidth = viewportWidth;
      this.onViewportResize();
      this.viewportTransformationSubject.next();
    }
  }
}
