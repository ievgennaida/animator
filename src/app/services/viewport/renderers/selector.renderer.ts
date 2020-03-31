import { Injectable } from "@angular/core";
import { LoggerService } from "../../logger.service";
import { Utils } from "../../utils/utils";
import { ViewService } from "../../view.service";

@Injectable({
  providedIn: "root",
})
export class SelectorRenderer {
  selectionRectElement: HTMLElement;

  constructor(
    protected viewService: ViewService,
    protected logger: LoggerService
  ) {}

  init(element: HTMLElement) {
    this.selectionRectElement = element;
  }

  drawSelector(selectionRect: DOMRect) {
    if (!this.selectionRectElement) {
      return;
    }

    if (!selectionRect) {
      if (
        this.selectionRectElement &&
        this.selectionRectElement.getAttribute("display") !== "none"
      ) {
        this.selectionRectElement.setAttribute("display", "none");
      }
      return;
    }

    const rect = Utils.matrixRectTransform(
      selectionRect,
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
