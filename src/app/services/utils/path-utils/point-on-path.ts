// See: https://github.com/rveciana/svg-path-properties
// The reason to calculate this 'manually' is a lack of the DOM function to get command by length.

import { PathDataCommand } from "../../../models/path/path-data-command";
import { PathType } from "../../../models/path/path-type";
import { Utils } from "../utils";
import {
  approximateArcLengthOfCurve,
  pointOnEllipticalArc,
  PointOnEllipticalArcResults,
} from "./arc-functions";
import {
  cubicPoint,
  getCubicArcLength,
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
  const t = t2length(fractionLength, fullLength, (i) =>
    getCubicArcLength(xs, ys, i)
  );

  return cubicPoint(xs, ys, t);
};
const getQuadraticPoint = (
  fractionLength: number,
  fullLength: number,
  xs: number[],
  ys: number[]
) => {
  const t = t2length(fractionLength, fullLength, (i) =>
    getQuadraticArcLength(xs, ys, i)
  );

  return quadraticPoint(xs, ys, t);
};
export class PointOnPathUtils {
  static getSegmentLength(command: PathDataCommand): number {
    const currentPoint = command.p;
    const prev = command.prev;
    const a = command.a;
    const b = command.b;
    // TODO: should be covered with unit tests
    const prevPoint = command.prevPoint || new DOMPoint(0, 0);
    // A arc
    if (command.type === PathType.arcAbs) {
      const lengthProperties = approximateArcLengthOfCurve(
        300,
        (t: number): PointOnEllipticalArcResults =>
          pointOnEllipticalArc(
            prevPoint,
            command.rx,
            command.ry,
            command.rotation,
            command.large,
            command.sweep,
            currentPoint,
            t
          )
      );

      return lengthProperties ? lengthProperties.arcLength : 0;
    } else if (
      // C
      command.type === PathType.cubicBezierAbs ||
      // S
      command.type === PathType.shorthandSmoothAbs
    ) {
      if (!prev || prev.isType(PathType.closeAbs) || !a || !b) {
        return 0;
      }

      const length = getCubicArcLength(
        [prevPoint.x, a.x, b.x, currentPoint.x],
        [prevPoint.y, a.y, b.y, currentPoint.y],
        1
      );

      return length;
    } else if (
      // Q Quadratic Bezier curves (x,y ax ay)
      command.type === PathType.quadraticBezierAbs ||
      // T
      command.type === PathType.smoothQuadraticBezierAbs
    ) {
      const isSmooth = command.type === PathType.smoothQuadraticBezierAbs;
      if (
        (a && !isSmooth && a.x !== currentPoint.x && a.y !== currentPoint.y) ||
        // Q, T
        (a &&
          isSmooth &&
          prev &&
          (prev.type === PathType.quadraticBezierAbs ||
            prev.type === PathType.smoothQuadraticBezierAbs))
      ) {
        const length = getQuadraticArcLength(
          [prevPoint.x, a.x, currentPoint.x],
          [prevPoint.y, a.y, currentPoint.y],
          1
        );
        return length;
      } else {
        return Utils.getDistance(prevPoint, currentPoint);
      }
      // T Shorthand/smooth quadratic Bezier curveto x,y
    } else if (
      command.type === PathType.closeAbs ||
      command.type === PathType.close
    ) {
      const moveCommand = PointOnPathUtils.getPrevByType(
        command,
        true,
        PathType.moveAbs
      );
      if (!moveCommand) {
        return 0;
      }
      const moveAbs = moveCommand;
      if (!moveAbs) {
        return 0;
      }
      return Utils.getDistance(moveAbs.p, prevPoint);
    } else {
      // L,H,V
      return Utils.getDistance(prevPoint, command.p);
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
    if (!command.isAbsolute()) {
      throw new Error(
        "get point on path is only for absolute commands. Pass absolute and convert to rel if required."
      );
    }

    if (fractionLength < 0) {
      fractionLength = 0;
    }
    if (command.type === PathType.moveAbs) {
      return null;
    }
    const maxLength =
      maxLengthCache === null
        ? PointOnPathUtils.getSegmentLength(command)
        : maxLengthCache;
    if (fractionLength > maxLength) {
      fractionLength = maxLength;
    }

    const currentPoint = command.p;
    const a = command.a;
    const b = command.b;
    const prevPoint = command.prevPoint || new DOMPoint(0, 0);
    const prev = command.prev;
    if (command.type === PathType.arcAbs) {
      return pointOnEllipticalArc(
        prevPoint,
        command.rx,
        command.ry,
        command.rotation,
        command.large,
        command.sweep,
        currentPoint,
        fractionLength / maxLength
      );
    } else if (
      // S
      command.type === PathType.shorthandSmoothAbs ||
      // C
      command.type === PathType.cubicBezierAbs
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
      // Q
      command.type === PathType.quadraticBezierAbs ||
      // T
      command.type === PathType.smoothQuadraticBezierAbs
    ) {
      const isSmooth = command.type === PathType.smoothQuadraticBezierAbs;
      if (
        (a && !isSmooth && a.x !== currentPoint.x && a.y !== currentPoint.y) ||
        // Q, T
        (isSmooth &&
          prev &&
          a &&
          (prev.type === PathType.quadraticBezierAbs ||
            prev.type === PathType.smoothQuadraticBezierAbs))
      ) {
        const xs = [prevPoint.x, a.x, currentPoint.x];
        const ys = [prevPoint.y, a.y, currentPoint.y];
        const length = getQuadraticPoint(fractionLength, maxLength, xs, ys);
        return length;
      }
      // T Shorthand/smooth quadratic Bezier curveto x,y
    } else if (command.type === PathType.closeAbs) {
      const moveCommand = PointOnPathUtils.getPrevByType(
        command,
        true,
        PathType.moveAbs
      );
      if (!moveCommand) {
        return null;
      }

      return Utils.getPointAtLength(moveCommand.p, prevPoint, fractionLength);
    }

    // L,H,V or failed Q, T
    return Utils.getPointAtLength(prevPoint, command.p, fractionLength);
  }
  /**
   * Get nearest next command by type.
   */
  static getNextByType(
    command: PathDataCommand | null,
    includeSelf: boolean,
    ...params: (PathType | string)[]
  ): PathDataCommand | null {
    if (!command) {
      return null;
    }
    if (!includeSelf) {
      command = command.next;
    }
    while (command) {
      if (command && command.isType(...params)) {
        return command;
      }
      command = command.next;
    }

    return null;
  }

  /**
   * Get nearest prev command by type.
   */
  static getPrevByType(
    command: PathDataCommand | null,
    includeSelf: boolean,
    ...params: (PathType | string)[]
  ): PathDataCommand | null {
    if (!command) {
      return null;
    }
    if (!includeSelf) {
      command = command.prev;
    }
    while (command) {
      if (command && command.isType(...params)) {
        return command;
      }
      command = command.prev;
    }

    return null;
  }
}
