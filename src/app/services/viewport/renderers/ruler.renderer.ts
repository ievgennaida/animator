import { Injectable, NgZone } from "@angular/core";
import { ViewportService } from "./../viewport.service";
import { LoggerService } from "../../logger.service";
import { PanTool } from "./../pan.tool";
import { consts } from "src/environments/consts";
import { BaseRenderer } from './base.renderer';

@Injectable({
  providedIn: "root"
})
export class RulerRenderer extends BaseRenderer {
  constructor(
    protected viewportService: ViewportService,
    protected logger: LoggerService
  ) {
    super();
  }

  options = {
    keysPerSecond: 60,
    snapsPerSeconds: 5, // from 1 to 60
    // approximate step in px for 1 tick
    tickPx: 120,
    smallTickPx: 75,
    smallSteps: 50,
    // additional left margin to start the gauge from
    marginLeft: 0,
    marginRight: 0,
    denominators: [1, 2, 5, 10]
  };

  valToPx(min, max, val, displaySize) {
    const distance = this.getDistance(min, max);
    let distanceOnLine = this.getDistance(min, val);
    if (val <= min) distanceOnLine = -distanceOnLine;
    const ratioDistances = distanceOnLine / distance;

    let pointOnLine = -ratioDistances * 0 + ratioDistances * displaySize;
    pointOnLine += this.options.marginLeft;
    return pointOnLine;
  }

  findGoodStep(originaStep, divisionCheck) {
    let step = originaStep;
    let lastDistance = null;
    const pow = this.getPowArgument(originaStep);
    const denominators = this.options.denominators;
    for (const denominator of denominators) {
      const calculatedStep = denominator * Math.pow(10, pow);
      if (divisionCheck && divisionCheck % calculatedStep !== 0) {
        continue;
      }

      const distance = this.getDistance(originaStep, calculatedStep);

      if (distance === 0 || (distance <= 0.1 && pow > 0)) {
        lastDistance = distance;
        step = calculatedStep;
        break;
      } else if (!lastDistance || lastDistance > distance) {
        lastDistance = distance;
        step = calculatedStep;
      }
    }

    return step;
  }

  drawTicks(
    adornersCTX: CanvasRenderingContext2D,
    ctx: CanvasRenderingContext2D,
    from: number,
    to: number,
    drawGridLines: boolean
  ) {
    if (isNaN(from) || isNaN(to) || from === to || !ctx || !adornersCTX) {
      return;
    }

    if (to < from) {
      const wasToVal = to;
      to = from;
      from = wasToVal;
    }

    const valDistance = this.getDistance(from, to);
    if (valDistance <= 0) {
      return;
    }

    const horizontal = ctx.canvas.width > ctx.canvas.height;
    const viewportSizeA = horizontal ? ctx.canvas.width : ctx.canvas.height;
    const viewportSizeB = horizontal ? ctx.canvas.height : ctx.canvas.width;
    // When step is set by pixel
    const displayStepsCanFit = viewportSizeA / consts.ruler.tickPx;
    const valueStep = valDistance / displayStepsCanFit;
    // Find the nearest 'beautiful' step for a gauge.
    // This step should be dividable by 1/2/5/10!

    const step = this.findGoodStep(valueStep, null);
    const smallStep = this.findGoodStep(valueStep / 5, null);

    // Find beautiful start point:
    const fromVal = Math.floor(from / step) * step;

    // Find a beautiful end point:
    const toVal = Math.ceil(to / step) * step + step;

    const gridLineWidth = this.onePixel;
    ctx.save();
    let lastTextLim = null;
    let lastTextStart = 0;
    for (let i = fromVal; i <= toVal; i += step) {
      if (this.getDistance(i, toVal) > step / 4) {
        let pos = this.valToPx(from, to, i, viewportSizeA);
        pos = this.getSharp(pos, gridLineWidth);
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = gridLineWidth;
        ctx.strokeStyle = consts.ruler.tickColor;
        if (horizontal) {
          this.drawLine(ctx, pos, 3, pos, viewportSizeB);
        } else {
          this.drawLine(ctx, 3, pos, viewportSizeB, pos);
        }

        if (drawGridLines) {
          this.drawGridLine(adornersCTX, pos, gridLineWidth, horizontal, true);
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
        ctx.restore();
      }

      // Draw small steps
      for (let x = i + smallStep; x < i + step; x += smallStep) {
        const nextPos = this.valToPx(from, to, x, viewportSizeA);
        // nextPos = this.getSharp(nextPos, gridLineWidth);
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
    ctx.restore();
  }
  drawGridLine(
    adornersCTX,
    pos: number,
    gridLineWidth: number,
    horizontal: boolean,
    bigLine: boolean
  ) {
    adornersCTX.save();
    adornersCTX.beginPath();
    adornersCTX.lineWidth = gridLineWidth;
    adornersCTX.strokeStyle = bigLine
      ? consts.gridLines.color
      : consts.gridLines.smallColor;
    if (horizontal) {
      this.drawLine(adornersCTX, pos, 0, pos, adornersCTX.canvas.height);
    } else {
      this.drawLine(adornersCTX, 0, pos, adornersCTX.canvas.width, pos);
    }
    adornersCTX.stroke();
    adornersCTX.restore();
  }

  redraw(
    ctx: CanvasRenderingContext2D,
    rulerWCTX: CanvasRenderingContext2D,
    rulerHCTX: CanvasRenderingContext2D,
    drawGridLines: boolean = true
  ) {
    this.clearBackground(ctx);
    this.clearBackground(rulerWCTX);
    this.clearBackground(rulerHCTX);
    const bounds = this.viewportService.getDisplayedBounds();
    if (bounds) {
      this.drawTicks(ctx, rulerWCTX, bounds.from.x, bounds.to.x, drawGridLines);
      this.drawTicks(ctx, rulerHCTX, bounds.from.y, bounds.to.y, drawGridLines);
    }
  }

  format(ms: number): string {
    // round two after coma:
    ms = Math.round(ms * 100) / 100;
    let postfix = "";
    if (Math.abs(ms) >= 1000) {
      ms = ms / 1000;
      postfix = "k";
    }

    return ms + postfix;
  }

  getPowArgument(toCheck) {
    if (!toCheck || toCheck === 0) {
      return 1;
    }
    // some optimiazation for numbers:
    if (toCheck >= 10 && toCheck < 100) {
      return 1;
    } else if (toCheck >= 100 && toCheck < 1000) {
      return 2;
    } else if (toCheck >= 1000 && toCheck < 10000) {
      return 3;
    }

    toCheck = Math.abs(toCheck);
    let category = 0;
    const s = Math.sign(toCheck);
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
