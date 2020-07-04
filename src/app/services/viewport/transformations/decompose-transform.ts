import { DecomposedMatrix } from "./decompose-matrix";

export class DecomposeTransform {
  static decomposeAnimatedTransformList(
    transforms: SVGAnimatedTransformList
  ): DecomposedMatrix {
    if (!transforms || !transforms.baseVal) {
      return null;
    }
    return DecomposeTransform.decomposeTransformList(transforms.baseVal);
  }
  static decomposeTransformList(
    transforms: SVGTransformList
  ): DecomposedMatrix {
    if (!transforms) {
      return null;
    }
    const decomposed = new DecomposedMatrix();
    for (let i = 0; i < transforms.numberOfItems; i++) {
      const item = transforms.getItem(i);

      if (item.type === item.SVG_TRANSFORM_MATRIX) {
        decomposed.add(DecomposedMatrix.decomposeMatrix(item.matrix));
      } else if (item.type === item.SVG_TRANSFORM_ROTATE) {
        // For SVG_TRANSFORM_ROTATE, a, b, c, d, e and f
        // together represent the matrix which will result in the given rotation.
        // When the rotation is around the center point (0, 0), e and f will be zero.
        decomposed.rotateZ += item.angle;
      } else if (item.type === item.SVG_TRANSFORM_SCALE) {
        // For SVG_TRANSFORM_SCALE,
        // a and d represent the scale amounts (b=0, c=0, e=0 and f=0).
        decomposed.add(DecomposedMatrix.decomposeMatrix(item.matrix));
      } else if (item.type === item.SVG_TRANSFORM_SKEWX) {
        // For SVG_TRANSFORM_SKEWX and SVG_TRANSFORM_SKEWY,
        // a, b, c and d represent the matrix which will result in the given skew (e=0 and f=0).
        decomposed.add(DecomposedMatrix.decomposeMatrix(item.matrix));
      } else if (item.type === item.SVG_TRANSFORM_SKEWY) {
        decomposed.add(DecomposedMatrix.decomposeMatrix(item.matrix));
      } else if (item.type === item.SVG_TRANSFORM_TRANSLATE) {
        // For SVG_TRANSFORM_TRANSLATE, e and f represent the
        // translation amounts (a=1, b=0, c=0 and d=1).
        decomposed.translateX += item.matrix.e;
        decomposed.translateY += item.matrix.f;
      } else if (item.type === item.SVG_TRANSFORM_UNKNOWN) {
      }
    }

    return decomposed;
  }
}
