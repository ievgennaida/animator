// See: https://github.com/rveciana/svg-path-properties
// The reason to calculate this 'manually' is a lack of the DOM function to get command by length.

import { Utils } from "../../../services/utils/utils";

export interface PointOnEllipticalArcResults extends DOMPoint {
  ellipticalArcAngle: number;
}

export const pointOnEllipticalArc = (
  p0: DOMPoint,
  rx: number,
  ry: number,
  xAxisRotation: number,
  largeArcFlag: boolean,
  sweepFlag: boolean,
  p1: DOMPoint,
  t: number
): PointOnEllipticalArcResults => {
  // In accordance to: http://www.w3.org/TR/SVG/implnote.html#ArcOutOfRangeParameters
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  xAxisRotation = Utils.mod(xAxisRotation, 360);
  const xAxisRotationRadians = Utils.rad(xAxisRotation);
  const toReturn = new DOMPoint(0, 0) as PointOnEllipticalArcResults;
  // If the endpoints are identical, then this is equivalent to omitting the elliptical arc segment entirely.
  if (p0.x === p1.x && p0.y === p1.y) {
    toReturn.x = p0.x;
    toReturn.y = p0.y;
    toReturn.ellipticalArcAngle = 0;
    return toReturn;
  }

  // If rx = 0 or ry = 0 then this arc is treated as a straight line segment joining the endpoints.
  if (rx === 0 || ry === 0) {
    // return this.pointOnLine(p0, p1, t);
    return { x: 0, y: 0, ellipticalArcAngle: 0 } as PointOnEllipticalArcResults; // Check if angle is correct
  }

  // Following "Conversion from endpoint to center parameterization"
  // http://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter

  // Step #1: Compute transformedPoint
  const dx = (p0.x - p1.x) / 2;
  const dy = (p0.y - p1.y) / 2;
  const transformedPoint = {
    x:
      Math.cos(xAxisRotationRadians) * dx + Math.sin(xAxisRotationRadians) * dy,
    y:
      -Math.sin(xAxisRotationRadians) * dx +
      Math.cos(xAxisRotationRadians) * dy,
  };
  // Ensure radii are large enough
  const radiiCheck =
    Math.pow(transformedPoint.x, 2) / Math.pow(rx, 2) +
    Math.pow(transformedPoint.y, 2) / Math.pow(ry, 2);
  if (radiiCheck > 1) {
    rx = Math.sqrt(radiiCheck) * rx;
    ry = Math.sqrt(radiiCheck) * ry;
  }

  // Step #2: Compute transformedCenter
  const cSquareNumerator =
    Math.pow(rx, 2) * Math.pow(ry, 2) -
    Math.pow(rx, 2) * Math.pow(transformedPoint.y, 2) -
    Math.pow(ry, 2) * Math.pow(transformedPoint.x, 2);
  const cSquareRootDenom =
    Math.pow(rx, 2) * Math.pow(transformedPoint.y, 2) +
    Math.pow(ry, 2) * Math.pow(transformedPoint.x, 2);
  let cRadicand = cSquareNumerator / cSquareRootDenom;
  // Make sure this never drops below zero because of precision
  cRadicand = cRadicand < 0 ? 0 : cRadicand;
  const cCoef = (largeArcFlag !== sweepFlag ? 1 : -1) * Math.sqrt(cRadicand);
  const transformedCenter = {
    x: cCoef * ((rx * transformedPoint.y) / ry),
    y: cCoef * (-(ry * transformedPoint.x) / rx),
  };

  // Step #3: Compute center
  const center = {
    x:
      Math.cos(xAxisRotationRadians) * transformedCenter.x -
      Math.sin(xAxisRotationRadians) * transformedCenter.y +
      (p0.x + p1.x) / 2,
    y:
      Math.sin(xAxisRotationRadians) * transformedCenter.x +
      Math.cos(xAxisRotationRadians) * transformedCenter.y +
      (p0.y + p1.y) / 2,
  };

  // Step #4: Compute start/sweep angles
  // Start angle of the elliptical arc prior to the stretch and rotate operations.
  // Difference between the start and end angles
  const startVector = {
    x: (transformedPoint.x - transformedCenter.x) / rx,
    y: (transformedPoint.y - transformedCenter.y) / ry,
  } as DOMPoint;
  const startAngle = angleBetween(
    {
      x: 1,
      y: 0,
    } as DOMPoint,
    startVector
  );

  const endVector = {
    x: (-transformedPoint.x - transformedCenter.x) / rx,
    y: (-transformedPoint.y - transformedCenter.y) / ry,
  } as DOMPoint;
  let sweepAngle = angleBetween(startVector, endVector);

  if (!sweepFlag && sweepAngle > 0) {
    sweepAngle -= 2 * Math.PI;
  } else if (sweepFlag && sweepAngle < 0) {
    sweepAngle += 2 * Math.PI;
  }
  // We use % instead of `mod(..)` because we want it to be -360deg to 360deg(but actually in radians)
  sweepAngle %= 2 * Math.PI;

  // From http://www.w3.org/TR/SVG/implnote.html#ArcParameterizationAlternatives
  const angle = startAngle + sweepAngle * t;
  const ellipseComponentX = rx * Math.cos(angle);
  const ellipseComponentY = ry * Math.sin(angle);

  toReturn.x =
    Math.cos(xAxisRotationRadians) * ellipseComponentX -
    Math.sin(xAxisRotationRadians) * ellipseComponentY +
    center.x;
  toReturn.y =
    Math.sin(xAxisRotationRadians) * ellipseComponentX +
    Math.cos(xAxisRotationRadians) * ellipseComponentY +
    center.y;
  // ellipticalArcStartAngle: startAngle,
  // ellipticalArcEndAngle: startAngle + sweepAngle,
  toReturn.ellipticalArcAngle = angle;
  // ellipticalArcCenter: center,
  // resultantRx: rx,
  // resultantRy: ry,

  return toReturn;
};

export const approximateArcLengthOfCurve = (
  resolution: number,
  pointOnCurveFunc: (t: number) => DOMPoint
) => {
  // Resolution is the number of segments we use
  resolution = resolution ? resolution : 500;

  let resultantArcLength = 0;
  const arcLengthMap = [];
  const approximationLines = [];

  let prevPoint = pointOnCurveFunc(0);
  let nextPoint;
  for (let i = 0; i < resolution; i++) {
    const t = Utils.clamp(i * (1 / resolution), 0, 1);
    nextPoint = pointOnCurveFunc(t);
    resultantArcLength += Utils.getLength(prevPoint, nextPoint);
    approximationLines.push([prevPoint, nextPoint]);

    arcLengthMap.push({
      t,
      arcLength: resultantArcLength,
    });

    prevPoint = nextPoint;
  }
  // Last stretch to the endpoint
  nextPoint = pointOnCurveFunc(1);
  approximationLines.push([prevPoint, nextPoint]);
  resultantArcLength += Utils.getLength(prevPoint, nextPoint);
  arcLengthMap.push({
    t: 1,
    arcLength: resultantArcLength,
  });

  return {
    arcLength: resultantArcLength,
    arcLengthMap,
    approximationLines,
  };
};

const angleBetween = (v0: DOMPoint, v1: DOMPoint) => {
  const p = v0.x * v1.x + v0.y * v1.y;
  const n = Math.sqrt(
    (Math.pow(v0.x, 2) + Math.pow(v0.y, 2)) *
      (Math.pow(v1.x, 2) + Math.pow(v1.y, 2))
  );
  const sign = v0.x * v1.y - v0.y * v1.x < 0 ? -1 : 1;
  const angle = sign * Math.acos(p / n);

  return angle;
};
