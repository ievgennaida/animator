// See: https://github.com/rveciana/svg-path-properties
// The reason to calculate this 'manually' is a lack of the DOM function to get command by length.

import { Utils } from "../../../services/utils/utils";
import { PathDataCommand } from "../../path/path-data-command";
import { PathType } from "../../path/path-type";
import {
  approximateArcLengthOfCurve,
  pointOnEllipticalArc,
  PointOnEllipticalArcResults,
} from "./arc-functions";
import {
  getCubicArcLength,
  cubicPoint,
  getQuadraticArcLength,
  quadraticPoint,
  t2length,
} from "./bezier-functions";

const getCubicPoint = (
  fractionLength: number,
  fullLength: number,
  xs: number[],
  ys: number[]
): DOMPoint => {
  const t = t2length(fractionLength, fullLength, (i) => {
    return getCubicArcLength(xs, ys, i);
  });

  return cubicPoint(xs, ys, t);
};
const getQuadraticPoint = (
  fractionLength: number,
  fullLength: number,
  xs: number[],
  ys: number[]
) => {
  const t = t2length(fractionLength, fullLength, (i) => {
    return getQuadraticArcLength(xs, ys, i);
  });

  return quadraticPoint(xs, ys, t);
};
export class PointOnPathUtils {
  static getSegmentLength(command: PathDataCommand): number {
    const abs = command.getAbsolute();

    const currentPoint = abs.p;
    let prevAbs = abs.prev;
    if (prevAbs) {
      prevAbs = abs.getAbsolute();
    }
    const a = abs.a;
    const b = abs.b;
    const prevPoint = abs.absPrevPoint;
    // A arc
    if (abs.type === PathType.arcAbs) {
      const r = abs.r;
      const lengthProperties = approximateArcLengthOfCurve(
        300,
        (t: number): PointOnEllipticalArcResults => {
          return pointOnEllipticalArc(
            prevPoint,
            r,
            abs.rotation,
            abs.large,
            abs.sweep,
            currentPoint,
            t
          );
        }
      );

      return lengthProperties ? lengthProperties.arcLength : 0;
      // C
    } else if (abs.type === PathType.cubicBezierAbs) {
      const length = getCubicArcLength(
        [prevPoint.x, a.x, b.x, currentPoint.x],
        [prevPoint.y, a.y, b.y, currentPoint.y],
        1
      );

      return length;
      // S
    } else if (abs.type === PathType.shorthandSmoothAbs) {
      if (!prevAbs) {
        return 0;
      }
      // C, S
      if (
        prevAbs.type === PathType.cubicBezierAbs ||
        prevAbs.type === PathType.shorthandSmoothAbs
      ) {
        const length = getCubicArcLength(
          [prevPoint.x, prevAbs.b.x, a.x, currentPoint.x],
          [prevPoint.y, prevAbs.b.y, a.y, currentPoint.y],
          1
        );
        return length;
      } else {
        return 0;
      }
      // Q Quadratic Bezier curves (x,y ax ay)
    } else if (
      abs.type === PathType.quadraticBezierAbs ||
      abs.type === PathType.smoothQuadraticBezierAbs
    ) {
      const isSmooth = abs.type === PathType.smoothQuadraticBezierAbs;
      if (
        (!isSmooth && a.x !== currentPoint.x && a.y !== currentPoint.y) ||
        // Q, T
        (isSmooth &&
          prevAbs &&
          (prevAbs.type === PathType.quadraticBezierAbs ||
            prevAbs.type === PathType.smoothQuadraticBezierAbs))
      ) {
        const length = getQuadraticArcLength(
          [prevPoint.x, a.x, currentPoint.x],
          [prevPoint.y, a.y, currentPoint.y],
          1
        );
        return length;
      } else {
        return Utils.getLength(prevPoint, currentPoint);
      }
      // T Shorthand/smooth quadratic Bezier curveto x,y
    } else if (abs.type === PathType.closeAbs || abs.type === PathType.close) {
      const moveCommand = this.getPrevMoveCommand(abs);
      if (!moveCommand) {
        return null;
      }
      const moveAbs = moveCommand.getAbsolute();
      if (!moveAbs) {
        return null;
      }
      return Utils.getLength(moveAbs.p, abs.absPrevPoint);
    } else {
      // L,H,V
      return Utils.getLength(prevPoint, abs.p);
    }
  }

  static getPointOnPath(
    command: PathDataCommand,
    fractionLength: number,
    maxLengthCache: number | null = null
  ): DOMPoint | null {
    if (!command) {
      return null;
    }
    if (fractionLength < 0) {
      fractionLength = 0;
    }

    const abs = command.getAbsolute();
    if (!abs || abs.type === PathType.moveAbs) {
      return null;
    }
    const maxLength =
      maxLengthCache === null
        ? PointOnPathUtils.getSegmentLength(abs)
        : maxLengthCache;
    if (fractionLength > maxLength) {
      fractionLength = maxLength;
    }

    const currentPoint = abs.p;
    const a = abs.a;
    const b = abs.b;
    const prevPoint = abs.absPrevPoint;
    let prevAbs = abs.prev;
    if (prevAbs) {
      prevAbs = prevAbs.getAbsolute();
    }

    if (abs.type === PathType.arcAbs) {
      const prev = abs.absPrevPoint;

      const r = abs.r;
      return pointOnEllipticalArc(
        prev,
        r,
        abs.rotation,
        abs.large,
        abs.sweep,
        currentPoint,
        fractionLength / maxLength
      );
      // C
    } else if (
      abs.type === PathType.shorthandSmoothAbs ||
      abs.type === PathType.cubicBezierAbs
    ) {
      // C, S
      if (prevPoint && a && b) {
        const xs = [prevPoint.x, a.x, b.x, currentPoint.x];
        const ys = [prevPoint.y, a.y, b.y, currentPoint.y];
        const point = getCubicPoint(fractionLength, maxLength, xs, ys);
        return point;
      }
      // Q Quadratic Bezier curves (x,y ax ay)
    } else if (
      abs.type === PathType.quadraticBezierAbs ||
      abs.type === PathType.smoothQuadraticBezierAbs
    ) {
      const isSmooth = abs.type === PathType.smoothQuadraticBezierAbs;
      if (
        (!isSmooth && a.x !== currentPoint.x && a.y !== currentPoint.y) ||
        // Q, T
        (isSmooth &&
          prevAbs &&
          (prevAbs.type === PathType.quadraticBezierAbs ||
            prevAbs.type === PathType.smoothQuadraticBezierAbs))
      ) {
        const xs = [prevPoint.x, a.x, currentPoint.x];
        const ys = [prevPoint.y, a.y, currentPoint.y];
        const length = getQuadraticPoint(fractionLength, maxLength, xs, ys);
        return length;
      }
      // T Shorthand/smooth quadratic Bezier curveto x,y
    } else if (abs.type === PathType.closeAbs) {
      const moveCommand = this.getPrevMoveCommand(abs);
      if (!moveCommand) {
        return null;
      }
      const moveAbs = moveCommand.getAbsolute();
      if (!moveAbs) {
        return null;
      }
      return Utils.getPointAtLength(
        moveAbs.p,
        abs.absPrevPoint,
        fractionLength
      );
    }

    // L,H,V or failed Q, T
    return Utils.getPointAtLength(abs.absPrevPoint, abs.p, fractionLength);
  }

  /**
   * Get prev move command.
   */
  static getPrevMoveCommand(command: PathDataCommand): PathDataCommand | null {
    if (!command) {
      return null;
    }

    while (command != null) {
      if (
        command &&
        (command.type === PathType.move || command.type === PathType.moveAbs)
      ) {
        return command;
      }
      command = command.prev;
    }

    return null;
  }
}
