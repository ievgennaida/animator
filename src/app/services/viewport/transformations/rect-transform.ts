import { MatrixTransform, TransformationMode } from "./matrix-transform";
import { Utils } from "../../utils/utils";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";

export class RectTransform extends MatrixTransform {
  transformPropertyX = "x";
  transformPropertyY = "y";
  sizePropertyX = "width";
  sizePropertyY = "height";
  consolidated = false;
  startRect: DOMRect = null;
  constructor(node: TreeNode) {
    super(node);
  }
  beginHandleTransformation(screenPos: DOMPoint, handle: HandleData) {
    this.startRect = new DOMRect(
      this.getX(),
      this.getY(),
      this.getSizeX(),
      this.getSizeY()
    );

    super.beginHandleTransformation(screenPos, handle);
    // this.mainSelectionRect = this.getElement().getBBox();
    // this.initBBox = this.startRect;
    /* const element = this.getElement();
    this.start = Utils.toElementPoint(element, screenPos);
    this.handle = handle;


    this.initBBox = handle.adorner.getBBox();
    this.mode = TransformationMode.Handle;*/
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
      const toSet = element[this.transformPropertyX].baseVal.value + offsetX;
      this.setX(toSet);
      changed = true;
    }

    if (offsetY) {
      const toSet = element[this.transformPropertyY].baseVal.value + offsetY;
      this.setY(toSet);
      changed = true;
    }

    return changed;
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
    const element = this.getElement();
    const propAttribute = element[prop];
    if (!propAttribute) {
      return null;
    }
    const val = propAttribute.baseVal;
    if (!val) {
      return null;
    }
    if (val.numberOfItems > 0) {
      return val[0].value;
    } else {
      return val.value;
    }
  }

  scaleOffset(
    offsetX: number | null,
    offsetY: number | null,
    transformPoint: DOMPoint
  ): boolean {
    const element = this.getElement();
    offsetY = this.normalizeScale(offsetY);
    offsetX = this.normalizeScale(offsetX);

    const transform =
      element.transform.baseVal.consolidate() ||
      element.ownerSVGElement.createSVGTransform();

    const matrix = super.generateScaleMatrix(offsetX, offsetY, transformPoint);

    const out = Utils.matrixRectTransform(this.startRect, matrix);
    if (!out) {
      return false;
    }

    this.onReverseScale(out, this.startRect);

    this.setX(out.x);
    this.setY(out.y);
    this.setSizeX(out.width);
    this.setSizeY(out.height);
    return true;
  }

  protected onReverseScale(rect: DOMRect, startRect: DOMRect): DOMRect {
    // Reverse scaling
    if (rect.width < 0 || rect.height < 0) {
      if (rect.width < 0) {
        rect.x += rect.width;
        rect.width = -rect.width;
      }

      if (rect.height < 0) {
        rect.y += rect.height;
        rect.height = -rect.height;
      }
    }

    return rect;
  }
  setSizeX(val: number) {
    val = Utils.round(val);
    if (val >= 0) {
      this.setAttribute(this.sizePropertyX, val);
    }
  }

  setSizeY(val: number) {
    val = Utils.round(val);
    if (val >= 0) {
      this.setAttribute(this.sizePropertyY, val);
    }
  }

  setX(val: number) {
    val = Utils.round(val);
    this.setAttribute(this.transformPropertyX, val);
  }

  setY(val: number) {
    val = Utils.round(val);
    this.setAttribute(this.transformPropertyY, val);
  }

  setAttribute(prop: string, val: number) {
    const element = this.getElement();
    element.setAttribute(prop, val.toString());
  }
  moveByMouse(screenPos: DOMPoint): boolean {
    const element = this.getElement();
    if (!this.consolidated) {
      // Used to convert matrix transform back to x,y attributes.
      this.consolidate(element);
      this.start.x -= this.getX();
      this.start.y -= this.getY();
      this.consolidated = true;
    }
    return super.moveByMouse(screenPos);
  }
  translate(point: DOMPoint): boolean {
    this.setX(point.x);
    this.setY(point.y);
    return true;
  }
}
