/**
 * Matrix decomposition:
 * https://www.w3.org/TR/css-transforms-1/
 */
export class DecomposedMatrix {
  rotateZ = 0;
  scaleX = 1;
  scaleY = 1;
  skewX = 0;
  skewY = 0;
  translateX = 0;
  translateY = 0;
  matrix: DOMMatrix | null = null;

  /**
   * https://www.w3.org/TR/css-transforms-1/
   *
   * @param m matrix to be decomposed.
   */
  static decomposeMatrix(m: DOMMatrix): DecomposedMatrix {
    let row0x = m.a;
    let row0y = m.b;
    let row1x = m.c;
    let row1y = m.d;

    let scaleX = Math.sqrt(row0x * row0x + row0y * row0y);
    let scaleY = Math.sqrt(row1x * row1x + row1y * row1y);

    // If determinant is negative, one axis was flipped.
    const determinant = row0x * row1y - row0y * row1x;
    if (determinant < 0) {
      if (row0x < row1y) {
        // Flip axis with minimum unit vector dot product.
        scaleX = -scaleX;
      } else {
        scaleY = -scaleY;
      }
    }
    // Compute rotation and re-normalize matrix.
    let angle = Math.atan2(row0y, row0x);

    // Re-normalize matrix to remove scale.
    if (scaleX) {
      row0x *= 1 / scaleX;
      row0y *= 1 / scaleX;
    }

    if (scaleY) {
      row1x *= 1 / scaleY;
      row1y *= 1 / scaleY;
    }

    if (angle) {
      // Rotate(-angle) = [cos(angle), sin(angle), -sin(angle), cos(angle)]
      //                = [row0x, -row0y, row0y, row0x]
      // Thanks to the normalization above.
      const sn = -row0y;
      const cs = row0x;
      const m11 = row0x;
      const m12 = row0y;
      const m21 = row1x;
      const m22 = row1y;
      row0x = cs * m11 + sn * m21;
      row0y = cs * m12 + sn * m22;
      row1x = -sn * m11 + cs * m21;
      row1y = -sn * m12 + cs * m22;
    }

    // Convert into degrees because our rotation functions expect it.
    angle = angle * (180 / Math.PI);
    // The requested parameters are then theta,
    // sx, sy, phi,

    const decomposedMatrix = new DecomposedMatrix();
    decomposedMatrix.translateX = m.e;
    decomposedMatrix.translateY = m.f;
    decomposedMatrix.rotateZ = angle;
    decomposedMatrix.scaleX = scaleX;
    decomposedMatrix.scaleY = scaleY;
    decomposedMatrix.matrix = new DOMMatrix([row0x, row0y, row1x, row1y, 0, 0]);
    return decomposedMatrix;
  }
  add(data: DecomposedMatrix): DecomposedMatrix {
    if (!data) {
      return this;
    }
    this.rotateZ += data.rotateZ;
    this.scaleX *= data.scaleX;
    this.scaleY *= data.scaleY;
    this.skewX += data.skewX;
    this.skewY += data.skewY;
    this.translateX += data.translateX;
    this.translateY += data.translateY;
    return this;
  }
}
