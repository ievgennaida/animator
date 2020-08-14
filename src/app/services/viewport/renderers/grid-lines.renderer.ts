import { Injectable, NgZone } from "@angular/core";
import { ViewService } from "../../view.service";
import { LoggerService } from "../../logger.service";
import { consts } from "src/environments/consts";
import { BaseRenderer } from "./base.renderer";
import { BehaviorSubject } from "rxjs";
import { TimelineUtils } from "animation-timeline-js";
import { Utils } from "../../utils/utils";

@Injectable({
  providedIn: "root",
})
export class GridLinesRenderer extends BaseRenderer {
  constructor(
    protected viewService: ViewService,
    protected logger: LoggerService
  ) {
    super();
  }

  gridLinesVisibleSubject = new BehaviorSubject<boolean>(consts.showGridLines);
  rulerVisibleSubject = new BehaviorSubject<boolean>(consts.showRuler);
  rulerVCTX: CanvasRenderingContext2D = null;
  rulerHCTX: CanvasRenderingContext2D = null;

  denominators = [1, 2, 5, 10];
  toggleShowGridLines() {
    this.gridLinesVisibleSubject.next(!this.gridLinesVisibleSubject.getValue());
    this.invalidate();
  }

  toggleRuler() {
    this.rulerVisibleSubject.next(!this.rulerVisibleSubject.getValue());
    this.invalidate();
  }
  gridLinesVisible() {
    return this.gridLinesVisibleSubject.getValue();
  }
  setRulers(
    rulerHElement: HTMLCanvasElement,
    rulerVElement: HTMLCanvasElement
  ) {
    this.rulerVCTX = this.initContext(rulerVElement);
    this.rulerHCTX = this.initContext(rulerHElement);
    this.invalidateSizeChanged();
  }

  public invalidateSizeChanged() {
    this.suspend();
    super.invalidateSizeChanged();
    if (
      this.rescaleCanvas(this.rulerHCTX) ||
      this.rescaleCanvas(this.rulerVCTX)
    ) {
      this.invalidate();
    }

    this.resume();
  }

  valToPx(min, max, val, displaySize) {
    const distance = Utils.getDistance(min, max);
    let distanceOnLine = Utils.getDistance(min, val);
    if (val <= min) {
      distanceOnLine = -distanceOnLine;
    }
    const ratioDistances = distanceOnLine / distance;

    let pointOnLine = -ratioDistances * 0 + ratioDistances * displaySize;
    // Margin left:
    pointOnLine += 0;
    return pointOnLine;
  }

  drawTicks(
    adornersCTX: CanvasRenderingContext2D,
    ctx: CanvasRenderingContext2D,
    from: number,
    to: number,
    horizontal: boolean,
    drawGridLines: boolean
  ) {
    if (isNaN(from) || isNaN(to) || from === to) {
      return;
    }

    if (to < from) {
      const wasToVal = to;
      to = from;
      from = wasToVal;
    }

    const valDistance = Utils.getDistance(from, to);
    if (valDistance <= 0) {
      return;
    }
    const sizeCTM = ctx || adornersCTX;
    if (!sizeCTM) {
      return;
    }

    const viewportSizeA = horizontal
      ? sizeCTM.canvas.width
      : sizeCTM.canvas.height;
    const viewportSizeB = horizontal
      ? sizeCTM.canvas.height
      : sizeCTM.canvas.width;
    if (viewportSizeA === 0 || viewportSizeB === 0) {
      return;
    }

    // When step is set by pixel
    const valueStep = valDistance / (viewportSizeA / consts.ruler.tickPx);

    // Find the nearest 'beautiful' step for a gauge.
    // This step should be dividable by 1/2/5/10!
    const step = TimelineUtils.findGoodStep(valueStep);
    const smallStep = TimelineUtils.findGoodStep(valueStep / 5);

    // Find beautiful start point:
    const fromVal = Math.floor(from / step) * step;

    // Find a beautiful end point:
    const toVal = Math.ceil(to / step) * step + step;

    const gridLineWidth = this.onePixel;
    if (
      isNaN(step) ||
      !Number.isFinite(step) ||
      step <= 0 ||
      Math.abs(toVal - fromVal) === 0
    ) {
      return;
    }
    const rulerActive =
      !!ctx &&
      ctx.canvas &&
      ctx.canvas.clientWidth > 0 &&
      ctx.canvas.clientHeight > 0;
    if (rulerActive) {
      ctx.save();
    }
    let lastTextLim = null;
    let lastTextStart = 0;
    for (let i = fromVal; i <= toVal; i += step) {
      if (Utils.getDistance(i, toVal) > step / 4) {
        let pos = this.valToPx(from, to, i, viewportSizeA);
        pos = this.getSharp(pos, gridLineWidth);
        if (rulerActive) {
          ctx.save();
          ctx.beginPath();
          ctx.lineWidth = gridLineWidth;
          ctx.strokeStyle = consts.ruler.tickColor;
          if (horizontal) {
            this.drawLine(ctx, pos, 3, pos, viewportSizeB);
          } else {
            this.drawLine(ctx, 3, pos, viewportSizeB, pos);
          }
          ctx.stroke();
          ctx.fillStyle = consts.ruler.color;

          if (consts.ruler.font) {
            ctx.font = consts.ruler.font;
          }

          const text = this.format(i);
          const textSize = ctx.measureText(text);
          const textPos = pos;
          ctx.stroke();

          // skip text render if there is no space for it.
          if (!lastTextLim || lastTextLim <= textPos) {
            let skip = false;

            lastTextLim = textPos + textSize.width + 2;
            // Last node is always displayed
            if (!lastTextStart) {
              let lastNodePos = this.valToPx(from, to, toVal, viewportSizeA);
              lastNodePos = this.getSharp(lastNodePos, gridLineWidth);
              lastTextStart = lastNodePos;
            }

            if (lastTextLim >= lastTextStart) {
              skip = true;
            }

            if (!skip) {
              if (horizontal) {
                ctx.fillText(text, textPos + 5, 10);
              } else {
                ctx.translate(0, textPos);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText(text, -textSize.width * 1.5, 12);
              }
            }
          }
        }

        if (drawGridLines) {
          this.drawGridLine(adornersCTX, pos, gridLineWidth, horizontal, true);
        }

        if (rulerActive) {
          ctx.restore();
        }
      }

      if (smallStep <= 0 || isNaN(smallStep) || !Number.isFinite(smallStep)) {
        continue;
      }

      // Draw small steps
      for (let x = i + smallStep; x < i + step; x += smallStep) {
        const nextPos = this.valToPx(from, to, x, viewportSizeA);
        // nextPos = this.getSharp(nextPos, gridLineWidth);
        if (rulerActive) {
          ctx.beginPath();
          ctx.lineWidth = gridLineWidth;
          ctx.strokeStyle = consts.ruler.smallTickColor;
          const margin = Math.floor(viewportSizeB * 0.8);
          if (horizontal) {
            this.drawLine(ctx, nextPos, margin, nextPos, viewportSizeB);
          } else {
            this.drawLine(ctx, margin, nextPos, viewportSizeB, nextPos);
          }
          ctx.stroke();
        }
        if (drawGridLines) {
          this.drawGridLine(
            adornersCTX,
            nextPos,
            gridLineWidth,
            horizontal,
            false
          );
        }
      }
    }
    lastTextLim = null;
    if (rulerActive) {
      ctx.restore();
    }
  }
  drawGridLine(
    ctx,
    pos: number,
    gridLineWidth: number,
    horizontal: boolean,
    bigLine: boolean
  ) {
    if (
      !ctx ||
      !ctx.canvas ||
      ctx.canvas.clientHeight === 0 ||
      ctx.canvas.clientWidth === 0
    ) {
      return;
    }

    ctx.beginPath();
    ctx.fillStyle = null;
    ctx.lineWidth = gridLineWidth;
    ctx.strokeStyle = bigLine
      ? consts.gridLineMainColor
      : consts.gridLineAltColor;
    if (horizontal) {
      this.drawLine(ctx, pos, 0, pos, ctx.canvas.height);
    } else {
      this.drawLine(ctx, 0, pos, ctx.canvas.width, pos);
    }
    ctx.stroke();
  }

  redraw() {
    // two rulers OR one ctx should be active.
    if ((!this.rulerVCTX || !this.rulerHCTX) && !this.ctx) {
      return;
    }

    this.invalidated = false;
    this.clear();
    this.clearBackground(this.rulerVCTX);
    this.clearBackground(this.rulerHCTX);
    const bounds = this.viewService.getDisplayedBounds();
    if (bounds) {
      this.drawTicks(
        this.ctx,
        this.rulerVCTX,
        bounds.x,
        bounds.x + bounds.width,
        true,
        this.gridLinesVisible()
      );
      this.drawTicks(
        this.ctx,
        this.rulerHCTX,
        bounds.y,
        bounds.y + bounds.height,
        false,
        this.gridLinesVisible()
      );
    }
  }

  format(ms: number): string {
    // round two after coma:
    ms = Utils.roundTwo(ms);
    let postfix = "";
    if (Math.abs(ms) >= 1000) {
      ms = ms / 1000;
      postfix = "k";
    }

    return ms + postfix;
  }

  getPowArgument(toCheck) {
    if (!toCheck || toCheck === 0 || !Number.isFinite(toCheck)) {
      return 1;
    }
    // some optimization for numbers:
    if (toCheck >= 10 && toCheck < 100) {
      return 1;
    } else if (toCheck >= 100 && toCheck < 1000) {
      return 2;
    } else if (toCheck >= 1000 && toCheck < 10000) {
      return 3;
    }

    toCheck = Math.abs(toCheck);
    let category = 0;
    const s = TimelineUtils.sign(toCheck);
    if (toCheck > 1) {
      while (toCheck >= 1) {
        toCheck = Math.floor(toCheck / 10.0);
        category++;
      }

      return s * category - 1;
    } else if (toCheck > 0.0) {
      // Get number of zeros before the number.
      let zerosCount = Math.floor(Math.log(toCheck) / Math.log(10) + 1);
      zerosCount = zerosCount - 1;
      return zerosCount;
    } else {
      return 1;
    }
  }
}
