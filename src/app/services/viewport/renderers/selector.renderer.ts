import { Injectable } from "@angular/core";
import { LoggerService } from "../../logger.service";
import { Utils } from "../../utils/utils";
import { ViewService } from "../../view.service";
import { BaseRenderer } from "./base.renderer";

@Injectable({
  providedIn: "root",
})
export class SelectorRenderer extends BaseRenderer {
  selectionRectElement: HTMLElement;
  rect: DOMRect;

  constructor(
    protected viewService: ViewService,
    protected logger: LoggerService
  ) {
    super();
  }

  init(element: HTMLElement) {
    this.selectionRectElement = element;
    this.invalidate();
  }

  setRect(rect: DOMRect) {
    this.rect = rect;
    this.invalidate();
  }

  redraw() {
    if (!this.selectionRectElement) {
      return;
    }
    this.invalidated = false;
    if (!this.rect) {
      if (
        this.selectionRectElement &&
        this.selectionRectElement.getAttribute("display") !== "none"
      ) {
        this.selectionRectElement.setAttribute("display", "none");
      }
      return;
    }

    const rect = Utils.matrixRectTransform(
      this.rect,
      this.viewService.getCTM()
    );
    const matrix = this.viewService.viewport.ownerSVGElement
      .createSVGMatrix()
      .translate(Utils.RoundTwo(rect.x), Utils.RoundTwo(rect.y));

    Utils.setCTM(this.selectionRectElement, matrix);
    this.selectionRectElement.setAttribute("display", "initial");
    const w = Utils.RoundTwo(rect.width).toString();
    this.selectionRectElement.setAttribute("width", w);
    const h = Utils.RoundTwo(rect.height).toString();
    this.selectionRectElement.setAttribute("height", h);
  }
}
