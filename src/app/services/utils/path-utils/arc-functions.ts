// See: https://github.com/rveciana/svg-path-properties by Roger Veciana i Rovira (MIT)
// The reason to calculate this 'manually' is a lack of the DOM function to get command by length.

import { Utils } from "../utils";

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
    resultantArcLength += Utils.getDistance(prevPoint, nextPoint);
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
  resultantArcLength += Utils.getDistance(prevPoint, nextPoint);
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

/*
 * Get an array of corresponding cubic bezier curve parameters for given arc curve parameters.
 * Based on work from Jarek Foksa(MIT License) arcToCubicCurves()
 * https://github.com/jarek-foksa/path-data-polyfill/blob/master/path-data-polyfill.js
 * a2c by Dmitry Baranovskiy (MIT License)
 * https://github.com/DmitryBaranovskiy/raphael/blob/v2.1.1/dev/raphael.core.js#L1837
 * http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
 */
export const arcToCubicCurves = (
  x1: number,
  y1: number,
  r1: number,
  r2: number,
  angleDeg: number,
  largeArcFlag: number,
  sweepFlag: number,
  x2: number,
  y2: number,
  recursive: number[] | null = null
): number[][] => {
  const degToRad = (degrees: number) => (Math.PI * degrees) / 180;

  const rotate = (x: number, y: number, rotateAngleRad: number) => {
    const X = x * Math.cos(rotateAngleRad) - y * Math.sin(rotateAngleRad);
    const Y = x * Math.sin(rotateAngleRad) + y * Math.cos(rotateAngleRad);
    return { x: X, y: Y };
  };

  const angleRad = degToRad(angleDeg);
  let params = [];
  let f1 = 0;
  let f2 = 0;
  let cx = 0;
  let cy = 0;

  if (recursive) {
    f1 = recursive[0];
    f2 = recursive[1];
    cx = recursive[2];
    cy = recursive[3];
  } else {
    const p1 = rotate(x1, y1, -angleRad);
    x1 = p1.x;
    y1 = p1.y;

    const p2 = rotate(x2, y2, -angleRad);
    x2 = p2.x;
    y2 = p2.y;

    const x = (x1 - x2) / 2;
    const y = (y1 - y2) / 2;
    let h = (x * x) / (r1 * r1) + (y * y) / (r2 * r2);

    if (h > 1) {
      h = Math.sqrt(h);
      r1 = h * r1;
      r2 = h * r2;
    }

    let sign = 1;

    if (largeArcFlag === sweepFlag) {
      sign = -1;
    }

    const r1Pow = r1 * r1;
    const r2Pow = r2 * r2;

    const left = r1Pow * r2Pow - r1Pow * y * y - r2Pow * x * x;
    const right = r1Pow * y * y + r2Pow * x * x;

    const k = sign * Math.sqrt(Math.abs(left / right));

    cx = (k * r1 * y) / r2 + (x1 + x2) / 2;
    cy = (k * -r2 * x) / r1 + (y1 + y2) / 2;

    f1 = Math.asin(parseFloat(((y1 - cy) / r2).toFixed(9)));
    f2 = Math.asin(parseFloat(((y2 - cy) / r2).toFixed(9)));

    if (x1 < cx) {
      f1 = Math.PI - f1;
    }
    if (x2 < cx) {
      f2 = Math.PI - f2;
    }

    if (f1 < 0) {
      f1 = Math.PI * 2 + f1;
    }
    if (f2 < 0) {
      f2 = Math.PI * 2 + f2;
    }

    if (sweepFlag && f1 > f2) {
      f1 = f1 - Math.PI * 2;
    }
    if (!sweepFlag && f2 > f1) {
      f2 = f2 - Math.PI * 2;
    }
  }

  let df = f2 - f1;

  if (Math.abs(df) > (Math.PI * 120) / 180) {
    const f2old = f2;
    const x2old = x2;
    const y2old = y2;

    if (sweepFlag && f2 > f1) {
      f2 = f1 + ((Math.PI * 120) / 180) * 1;
    } else {
      f2 = f1 + ((Math.PI * 120) / 180) * -1;
    }

    x2 = cx + r1 * Math.cos(f2);
    y2 = cy + r2 * Math.sin(f2);
    params = arcToCubicCurves(
      x2,
      y2,
      r1,
      r2,
      angleDeg,
      0,
      sweepFlag,
      x2old,
      y2old,
      [f2, f2old, cx, cy]
    );
  }

  df = f2 - f1;

  const c1 = Math.cos(f1);
  const s1 = Math.sin(f1);
  const c2 = Math.cos(f2);
  const s2 = Math.sin(f2);
  const t = Math.tan(df / 4);
  const hx = (4 / 3) * r1 * t;
  const hy = (4 / 3) * r2 * t;

  const m1 = [x1, y1];
  const m2 = [x1 + hx * s1, y1 - hy * c1];
  const m3 = [x2 + hx * s2, y2 - hy * c2];
  const m4 = [x2, y2];

  m2[0] = 2 * m1[0] - m2[0];
  m2[1] = 2 * m1[1] - m2[1];

  if (recursive) {
    return [m2, m3, m4].concat(params);
  } else {
    params = [m2, m3, m4].concat(params);

    const curves = [];

    for (let i = 0; i < params.length; i += 3) {
      const r1Rot = rotate(params[i][0], params[i][1], angleRad);
      const r2Rot = rotate(params[i + 1][0], params[i + 1][1], angleRad);
      const r3 = rotate(params[i + 2][0], params[i + 2][1], angleRad);
      curves.push([r1Rot.x, r1Rot.y, r2Rot.x, r2Rot.y, r3.x, r3.y]);
    }

    return curves;
  }
};
