import { Injectable } from "@angular/core";
import { consts } from "src/environments/consts";
import { LoggerService } from "../logger.service";
import { MatrixUtils } from "../utils/matrix-utils";
import { ViewService } from "../view.service";
import { BaseRenderer } from "./base.renderer";

@Injectable({
  providedIn: "root",
})
export class SelectorRenderer extends BaseRenderer {
  selectionRectElement: HTMLElement;
  rect: DOMRect | null = null;

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

  clear() {
    this.setRect(null);
  }
  setRect(rect: DOMRect | null) {
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

    const transformed = MatrixUtils.matrixRectTransform(
      this.rect,
      this.viewService.getCTM()
    );
    this.ctx.strokeStyle = consts.selector.stroke;
    this.ctx.fillStyle = consts.selector.fill;
    this.ctx.lineWidth = consts.selector.strokeThickness;
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
