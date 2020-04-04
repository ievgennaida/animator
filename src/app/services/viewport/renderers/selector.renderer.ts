import { Injectable } from "@angular/core";
import { LoggerService } from "../../logger.service";
import { Utils } from "../../utils/utils";
import { ViewService } from "../../view.service";
import { BaseRenderer } from "./base.renderer";
import { consts } from "src/environments/consts";

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
    if (!this.ctx) {
      return;
    }
    this.invalidated = false;
    this.clearBackground(this.ctx);
    if (!this.rect) {
      return;
    }

    const transformed = Utils.matrixRectTransform(
      this.rect,
      this.viewService.getCTM()
    );
    this.ctx.strokeStyle = consts.selector.stroke;
    this.ctx.fillStyle = consts.selector.fill;
    this.ctx.lineWidth = consts.selector.strokeThinkness;
    this.ctx.fillRect(
      transformed.x,
      transformed.y,
      transformed.width,
      transformed.height
    );
    this.ctx.strokeRect(
      transformed.x,
      transformed.y,
      transformed.width,
      transformed.height
    );
    this.ctx.stroke();
  }
}
