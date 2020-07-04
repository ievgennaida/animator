import { MatrixTransform, TransformationMode } from "./matrix-transform";
import { TransformsService } from "./transforms.service";
import { Utils } from "../../utils/utils";
import { AdornerType } from "../adorners/adorner-type";
import { HandleData } from "src/app/models/handle-data";

export class RectTransform extends MatrixTransform {
  transformPropertyX = "x";
  transformPropertyY = "y";
  sizePropertyX = "width";
  sizePropertyY = "height";
  constructor(
    element: SVGGraphicsElement,
    transformsService: TransformsService
  ) {
    super(element, transformsService);
  }
  beginHandleTransformation(handle: HandleData, screenPos: DOMPoint) {
    this.start = Utils.toElementPoint(this.element, screenPos);
    this.handle = handle;
    this.initBBox = new DOMRect(
      this.getX(),
      this.getY(),
      this.getSizeX(),
      this.getSizeY()
    );
    this.mode = TransformationMode.Handle;
  }
  beginMouseTransaction(mousePos: DOMPoint) {
    this.consolidate(this.element);
    super.beginMouseTransaction(mousePos);
    this.start.x -= this.getX();
    this.start.y -= this.getY();
  }

  /**
   * Convert transformation matrix to the X, Y coords as a preferable way to handle rect coords.
   */
  consolidate(element: SVGGraphicsElement) {
    let offsetX = 0;
    let offsetY = 0;
    const transformList = element.transform.baseVal;
    let changed = false;
    if (transformList.numberOfItems === 1) {
      const transform = transformList[0];
      if (transform.type === transform.SVG_TRANSFORM_TRANSLATE) {
        element.transform.baseVal.removeItem(0);
        offsetX = transform.matrix.e;
        offsetY = transform.matrix.f;
        element.removeAttribute("transform");
        changed = true;
      }
    } else if (transformList.numberOfItems > 1) {
      let consolidationRequired = true;
      for (let i = 0; i <= transformList.numberOfItems; i++) {
        const tr = transformList[i];
        if (
          tr &&
          (tr.type === tr.SVG_TRANSFORM_TRANSLATE ||
            tr.type === tr.SVG_TRANSFORM_MATRIX) &&
          tr.matrix.e &&
          tr.matrix.f
        ) {
          consolidationRequired = true;
          break;
        }
      }

      if (consolidationRequired) {
        const transform = transformList.consolidate();
        offsetX = transform.matrix.e;
        offsetY = transform.matrix.f;

        // Remove x and y from the matrix:
        const toSet = transform.matrix.translate(
          -transform.matrix.e,
          -transform.matrix.f
        );

        transform.setMatrix(toSet);
        element.transform.baseVal.initialize(transform);
        changed = true;
      }
    }

    if (offsetX) {
      const toSet =
        this.element[this.transformPropertyX].baseVal.value + offsetX;
      this.setX(toSet);
      changed = true;
    }

    if (offsetY) {
      const toSet =
        this.element[this.transformPropertyY].baseVal.value + offsetY;
      this.setY(toSet);
      changed = true;
    }

    if (changed) {
      this.transformsService.emitTransformed(this.element);
    }
  }
  /**
   * Should be consolidated first to get proper value.
   */
  getX(): number {
    return this.getProp(this.transformPropertyX);
  }
  getY(): number {
    return this.getProp(this.transformPropertyY);
  }
  getSizeX(): number {
    return this.getProp(this.sizePropertyX);
  }
  getSizeY(): number {
    return this.getProp(this.sizePropertyY);
  }
  getProp(prop: string) {
    const propAttribute = this.element[prop];
    return propAttribute.baseVal.value;
  }

  transformHandle(screenPos: DOMPoint) {
    const offset = Utils.toElementPoint(this.element, screenPos);
    if (this.start) {
      offset.x -= this.start.x;
      offset.y -= this.start.y;
    }

    const handle = this.handle.handles;
    if (Utils.bitwiseEquals(handle, AdornerType.BottomRight)) {
      this.setSizeX(this.initBBox.width + offset.x);
      this.setSizeY(this.initBBox.height + offset.y);
    } else if (Utils.bitwiseEquals(handle, AdornerType.BottomCenter)) {
      this.setSizeY(this.initBBox.height + offset.y);
    } else if (Utils.bitwiseEquals(handle, AdornerType.RightCenter)) {
      this.setSizeX(this.initBBox.width + offset.x);
    } else if (Utils.bitwiseEquals(handle, AdornerType.TopLeft)) {
      this.setY(this.initBBox.y + offset.y);
      this.setX(this.initBBox.x + offset.x);
      this.setSizeX(this.initBBox.width - offset.x);
      this.setSizeY(this.initBBox.height - offset.y);
    } else if (Utils.bitwiseEquals(handle, AdornerType.TopCenter)) {
      this.setY(this.initBBox.y + offset.y);
      this.setSizeY(this.initBBox.height - offset.y);
    } else if (Utils.bitwiseEquals(handle, AdornerType.TopRight)) {
      this.setY(this.initBBox.y + offset.y);
      this.setSizeY(this.initBBox.height - offset.y);
      this.setSizeX(this.initBBox.width + offset.x);
    } else if (Utils.bitwiseEquals(handle, AdornerType.LeftCenter)) {
      this.setX(this.initBBox.x + offset.x);
      this.setSizeX(this.initBBox.width - offset.x);
    } else if (Utils.bitwiseEquals(handle, AdornerType.BottomLeft)) {
      this.setX(this.initBBox.x + offset.x);
      this.setSizeX(this.initBBox.width - offset.x);
      this.setSizeY(this.initBBox.height + offset.y);
    }
    this.transformsService.emitTransformed(this.element);
  }

  setSizeX(val: number) {
    val = Utils.roundTwo(val);
    if (val >= 0) {
      this.setAttribute(this.sizePropertyX, val);
    }
  }

  setSizeY(val: number) {
    val = Utils.roundTwo(val);
    if (val >= 0) {
      this.setAttribute(this.sizePropertyY, val);
    }
  }

  setX(val: number) {
    val = Utils.roundTwo(val);
    this.setAttribute(this.transformPropertyX, val);
  }

  setY(val: number) {
    val = Utils.roundTwo(val);
    this.setAttribute(this.transformPropertyY, val);
  }

  setAttribute(prop: string, val: number) {
    this.element.setAttribute(prop, val.toString());
  }

  translate(point: DOMPoint) {
    this.setX(point.x);
    this.setY(point.y);
    this.transformsService.emitTransformed(this.element);
  }
}
