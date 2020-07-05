import { DecomposedMatrix } from "./decompose-matrix";
import { Utils } from "../../utils/utils";
import { TransformsService } from "./transforms.service";
import { AdornerType } from "../adorners/adorner-type";
import { HandleData } from "src/app/models/handle-data";
import { DecomposeTransform } from "./decompose-transform";
export enum TransformationMode {
  Skew,
  Translate,
  Handle,
  Rotate,
}
export class MatrixTransform {
  start: DOMPoint = null;
  initBBox: DOMRect = null;
  startOffset = 0;
  vertical = true;
  mode: TransformationMode = TransformationMode.Translate;
  handle: HandleData;
  /**
   *
   */
  constructor(
    protected element: SVGGraphicsElement,
    protected transformsService: TransformsService
  ) {}

  beginHandleTransformation(handle: HandleData, screenPos: DOMPoint) {
    this.start = Utils.toElementPoint(this.element, screenPos);
    this.handle = handle;
    this.mode = TransformationMode.Handle;
    this.initBBox = this.element.getBBox();
  }

  beginMouseTransaction(screenPos: DOMPoint) {
    const startPoint = Utils.toElementPoint(this.element, screenPos);
    this.start = startPoint;
    this.mode = TransformationMode.Translate;
  }

  beginSkewTransaction(pos: DOMPoint, vertical: boolean = false) {
    this.mode = TransformationMode.Skew;
    this.vertical = vertical;
    const centerBox = Utils.getCenterTransform(this.element);
    this.start = centerBox;
    const transformedCenter = Utils.toScreenPoint(this.element, centerBox);
    this.startOffset = vertical
      ? transformedCenter.x - pos.x
      : transformedCenter.y - pos.y;
  }
  getSizeX(): number {
    return this.element.getBBox().width;
  }
  getSizeY(): number {
    return this.element.getBBox().height;
  }

  beginMouseRotateTransaction(pos: DOMPoint) {
    this.mode = TransformationMode.Rotate;
    const transformOrigin = this.getTransformOrigin();
    const transformedCenter = Utils.toScreenPoint(
      this.element,
      transformOrigin
    );
    this.startOffset = -Utils.angle(transformedCenter, pos);

    const matrix = this.transformToElement(
      this.element,
      this.element.parentNode as SVGGraphicsElement
    );

    const decomposed = this.decomposeMatrix(matrix);
    this.startOffset -= decomposed.rotateZ;
  }

  transformElementToScreen(
    element: SVGGraphicsElement,
    elementPos: DOMPoint
  ): DOMPoint {
    const current = elementPos.matrixTransform(element.getScreenCTM());
    return current;
  }

  transformToElement(
    fromElement: SVGGraphicsElement,
    toElement: SVGGraphicsElement
  ): DOMMatrix {
    if (!toElement || !fromElement) {
      return null;
    }

    return toElement
      .getScreenCTM()
      .inverse()
      .multiply(fromElement.getScreenCTM());
  }

  transformByMouse(screenPos: DOMPoint) {
    if (this.mode === TransformationMode.Rotate) {
      this.rotateByMouse(screenPos);
    } else if (this.mode === TransformationMode.Skew) {
      this.skewByMouse(screenPos);
    } else if (this.mode === TransformationMode.Translate) {
      this.moveByMouse(screenPos);
    } else if (this.mode === TransformationMode.Handle) {
      this.transformHandle(screenPos);
    }
  }
  transformHandle(screenPos: DOMPoint) {
    this.scaleByMouse(screenPos);
  }
  scaleByMouse(screenPos: DOMPoint) {
    const newElementPos = Utils.toElementPoint(this.element, screenPos);
    const offset = newElementPos;
    if (!offset) {
      return;
    }

    const bbox = this.initBBox; //this.element.getBBox();
    const handle = this.handle.handles;
    let newWidth = bbox.width;
    let newHeight = bbox.height;
    let scaleX = null;
    let scaleY = null;
    const x = bbox.x;
    const y = bbox.y;
    const transformPoint = new DOMPoint(x + bbox.width, y + bbox.height);
    if (Utils.bitwiseEquals(handle, AdornerType.TopLeft)) {
      newWidth = x + bbox.width - newElementPos.x;
      newHeight = y + bbox.height - newElementPos.y;
      scaleX = newWidth / bbox.width;
      scaleY = newHeight / bbox.height;
    } else if (Utils.bitwiseEquals(handle, AdornerType.LeftCenter)) {
      newWidth = bbox.x + bbox.width - newElementPos.x;
      scaleX = newWidth / bbox.width;
    } else if (Utils.bitwiseEquals(handle, AdornerType.TopCenter)) {
      newHeight = bbox.y + bbox.height - newElementPos.y;
      scaleY = newHeight / bbox.height;
    } else if (Utils.bitwiseEquals(handle, AdornerType.TopRight)) {
      transformPoint.x = bbox.x;
      newWidth = newElementPos.x - bbox.x;
      scaleX = newWidth / bbox.width;
      newHeight = y + bbox.height - newElementPos.y;
      scaleY = newHeight / bbox.height;
    } else if (Utils.bitwiseEquals(handle, AdornerType.RightCenter)) {
      transformPoint.x = x;
      transformPoint.y = y;
      newWidth = newElementPos.x - bbox.x;
      scaleX = newWidth / bbox.width;
    } else if (Utils.bitwiseEquals(handle, AdornerType.BottomRight)) {
      transformPoint.x = x;
      transformPoint.y = y;
      newWidth = newElementPos.x - bbox.x;
      newHeight = newElementPos.y - bbox.y;
      scaleX = newWidth / bbox.width;
      scaleY = newHeight / bbox.height;
    } else if (Utils.bitwiseEquals(handle, AdornerType.BottomCenter)) {
      transformPoint.x = x;
      transformPoint.y = y;
      newHeight = newElementPos.y - bbox.y;
      scaleY = newHeight / bbox.height;
    } else if (Utils.bitwiseEquals(handle, AdornerType.BottomLeft)) {
      transformPoint.y = y;
      newWidth = x + bbox.width - newElementPos.x;
      scaleX = newWidth / bbox.width;
      newHeight = newElementPos.y - bbox.y;
      scaleY = newHeight / bbox.height;
    }

    this.scaleOffset(scaleX, scaleY, transformPoint);
  }

  moveByMouse(screenPos: DOMPoint) {
    const offset = Utils.toElementPoint(this.element, screenPos);
    if (!offset) {
      return;
    }
    if (this.start) {
      offset.x -= this.start.x;
      offset.y -= this.start.y;
    }
    this.translate(offset);
  }

  translate(screenPoint: DOMPoint) {
    // console.log("move:" + point.x + "x" + point.y);
    const transformList = this.element.transform;
    if (transformList.baseVal.numberOfItems === 0) {
      const svgTransform = this.element.ownerSVGElement.createSVGTransform();
      svgTransform.setTranslate(screenPoint.x, screenPoint.y);
      transformList.baseVal.appendItem(svgTransform);
      this.transformsService.emitTransformed(this.element);
      return;
    } else if (transformList.baseVal.numberOfItems === 1) {
      const svgTransform = transformList.baseVal[0];
      if (svgTransform.type === svgTransform.SVG_TRANSFORM_TRANSLATE) {
        const decompose = DecomposeTransform.decomposeTransformList(
          transformList.baseVal
        );
        if (decompose && decompose.translateX && decompose.translateY) {
          svgTransform.setTranslate(
            decompose.translateX + screenPoint.x,
            decompose.translateY + screenPoint.y
          );
        } else {
          svgTransform.setTranslate(screenPoint.x, screenPoint.y);
        }
        this.transformsService.emitTransformed(this.element);
        return;
      }
    }

    const transform =
      this.element.transform.baseVal.consolidate() ||
      this.element.ownerSVGElement.createSVGTransform();

    const matrix = transform.matrix.translate(screenPoint.x, screenPoint.y);
    transform.setMatrix(matrix);

    this.element.transform.baseVal.initialize(transform);

    this.transformsService.emitTransformed(this.element);
  }

  decomposeMatrix(matrix: DOMMatrix): DecomposedMatrix {
    const dec2 = DecomposedMatrix.decomposeMatrix(matrix);
    return dec2;
  }

  getTransformOrigin(): DOMPoint {
    return Utils.getCenterTransform(this.element);
  }

  rotateByMouse(currentViewPoint: DOMPoint) {
    const transformPoint = this.getTransformOrigin();

    const screenTransformOrigin = Utils.toScreenPoint(
      this.element,
      transformPoint
    );
    let angle = -Utils.angle(screenTransformOrigin, currentViewPoint);

    angle -= this.startOffset;

    this.rotate(angle, transformPoint);
  }
  scaleOffset(offsetX: number, offsetY: number, transformPoint: DOMPoint) {
    const transformList = this.element.transform;
    /*
    if (transformList.baseVal.numberOfItems === 0) {
      transformList.baseVal.appendItem(svgTransform);
      this.transformsService.emitTransformed(this.element);
      return;
    } else if (transformList.baseVal.numberOfItems === 1) {
      const svgTransform = transformList.baseVal[0];
      if (svgTransform.type === svgTransform.SVG_TRANSFORM_SCALE) {
        const decomposed = this.decomposeMatrix(svgTransform.matrix);

        const offsetX = scale.x / decomposed.scaleX;
        const offsetY = scale.y / decomposed.scaleY;
        svgTransform.setScale(
          offsetX,
          offsetY
        );
        this.transformsService.emitTransformed(this.element);
        return;
      }
    }*/

    const transform =
      this.element.transform.baseVal.consolidate() ||
      this.element.ownerSVGElement.createSVGTransform();
    transformPoint = transformPoint.matrixTransform(transform.matrix);

    const svgTransform = this.element.ownerSVGElement.createSVGTransform();
    offsetY = offsetY === null ? 1 : offsetY;
    offsetX = offsetX === null ? 1 : offsetX;
    svgTransform.setScale(offsetX, offsetY);

    const matrix = this.element.ownerSVGElement
      .createSVGMatrix()
      .translate(transformPoint.x, transformPoint.y)
      // multiply is used instead of the scale while proportional scale is applied for a scale (?)
      .multiply(svgTransform.matrix)
      .translate(-transformPoint.x, -transformPoint.y)
      .multiply(transform.matrix);

    transform.setMatrix(matrix);
    this.element.transform.baseVal.initialize(transform);
    // TODO: use generic monitoring for the elements
    this.transformsService.emitTransformed(this.element);
  }

  /**
   * Set direct scale value.
   */
  scale(scaleX: number, scaleY: number, transformPoint: DOMPoint) {
    const transformList = this.element.transform;
    const transform =
      this.element.transform.baseVal.consolidate() ||
      this.element.ownerSVGElement.createSVGTransform();
    transformPoint = transformPoint.matrixTransform(transform.matrix);
    const decomposed = this.decomposeMatrix(transform.matrix);
    if (
      decomposed.rotateZ === -180 &&
      (decomposed.scaleX !== 1 || decomposed.scaleY !== 1)
    ) {
      decomposed.rotateZ = 0;
      decomposed.scaleX = -decomposed.scaleX;
      decomposed.scaleY = -decomposed.scaleY;
    }

    const offsetX = scaleX ? scaleX / decomposed.scaleX : 1;
    const offsetY = scaleY ? scaleY / decomposed.scaleY : 1;

    const svgTransform = this.element.ownerSVGElement.createSVGTransform();
    svgTransform.setScale(offsetX, offsetY);

    const matrix = this.element.ownerSVGElement
      .createSVGMatrix()
      .translate(transformPoint.x, transformPoint.y)
      // multiply is used instead of the scale while proportional scale is applied for a scale (?)
      .multiply(svgTransform.matrix)
      .translate(-transformPoint.x, -transformPoint.y)
      .multiply(transform.matrix);

    transform.setMatrix(matrix);
    this.element.transform.baseVal.initialize(transform);
    // TODO: use generic monitoring for the elements
    this.transformsService.emitTransformed(this.element);
  }

  rotate(angle: number, transformPoint: DOMPoint) {
    const transformList = this.element.transform;
    if (transformList.baseVal.numberOfItems === 0) {
      const svgTransform = this.element.ownerSVGElement.createSVGTransform();
      svgTransform.setRotate(angle, transformPoint.x, transformPoint.y);
      transformList.baseVal.appendItem(svgTransform);
      this.transformsService.emitTransformed(this.element);
      return;
    } else if (transformList.baseVal.numberOfItems === 1) {
      const svgTransform = transformList.baseVal[0];
      if (svgTransform.type === svgTransform.SVG_TRANSFORM_ROTATE) {
        svgTransform.setRotate(angle, transformPoint.x, transformPoint.y);
        this.transformsService.emitTransformed(this.element);
        return;
      }
    }

    const transform =
      this.element.transform.baseVal.consolidate() ||
      this.element.ownerSVGElement.createSVGTransform();

    transformPoint = transformPoint.matrixTransform(transform.matrix);
    const currentAngle = this.decomposeMatrix(transform.matrix).rotateZ;

    const offset = -(currentAngle - angle);
    const matrix = this.element.ownerSVGElement
      .createSVGMatrix()
      .translate(transformPoint.x, transformPoint.y)
      .rotate(offset, 0)
      .translate(-transformPoint.x, -transformPoint.y)
      .multiply(transform.matrix);

    transform.setMatrix(matrix);
    this.element.transform.baseVal.initialize(transform);
    // TODO: use generic monitoring for the elements
    this.transformsService.emitTransformed(this.element);
  }

  skewByMouse(screenPos: DOMPoint) {
    const transformedCenter = new DOMPoint(
      this.vertical ? screenPos.x + this.startOffset : this.start.x,
      this.vertical ? this.start.y : screenPos.y + this.startOffset
    );

    let deg = -Utils.angle(transformedCenter, screenPos);
    if (!this.vertical) {
      deg = -deg - 90;
    }

    this.start = new DOMPoint(screenPos.x, screenPos.y);
    this.skewOffset(deg, this.vertical);
  }

  skewOffset(deg: number, vertical: boolean) {
    const transform =
      this.element.transform.baseVal.consolidate() ||
      this.element.ownerSVGElement.createSVGTransform();
    const centerBox = this.getTransformOrigin().matrixTransform(
      transform.matrix
    );
    let matrix = this.element.ownerSVGElement
      .createSVGMatrix()
      .translate(centerBox.x, centerBox.y);

    if (vertical) {
      matrix = matrix.skewY(deg);
    } else {
      matrix = matrix.skewX(deg);
    }

    matrix = matrix
      .translate(-centerBox.x, -centerBox.y)
      .multiply(transform.matrix);

    transform.setMatrix(matrix);
    this.element.transform.baseVal.initialize(transform);
    this.transformsService.emitTransformed(this.element);
  }
}
