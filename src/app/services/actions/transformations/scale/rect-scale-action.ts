import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { PropertiesService } from "src/app/services/properties.service";
import { MatrixUtils } from "../../../utils/matrix-utils";
import { MatrixScaleAction } from "./matrix-scale-action";

@Injectable({
  providedIn: "root",
})
export class RectScaleAction extends MatrixScaleAction {
  constructor(propertiesService: PropertiesService) {
    super(propertiesService);
  }
  title = "Scale";
  icon = "aspect_ratio";
  consolidated = false;
  propX = "x";
  propY = "y";
  sizePropertyX = "width";
  sizePropertyY = "height";

  startRect: DOMRect = null;
  /**
   * Start click position in anchor coordinates.
   */
  start: DOMPoint = null;

  /**
   * Transformation coordinates anchor.
   */
  anchor: SVGGraphicsElement = null;
  transformOrigin: DOMPoint = null;
  adornerOrigin: DOMPoint = null;
  initTransformMatrix: DOMMatrix = null;
  /**
   * Set points to be displayed.
   */
  debugPoints: DOMPoint[] = [];
  transformElementCoordinates = false;

  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData) {
    this.attributesToStore = [
      this.propX,
      this.propY,
      this.sizePropertyX,
      this.sizePropertyY,
      MatrixUtils.TransformPropertyKey,
    ];
    this.node = node;
    this.handle = handle;
    this.startRect = new DOMRect(
      this.getX(),
      this.getY(),
      this.getSizeX(),
      this.getSizeY()
    );

    super.init(node, screenPos, handle);
  }

  getElement(): SVGGraphicsElement | null {
    return this.node?.getElement() || null;
  }

  /**
   * Apply matrix in screen coordinates,
   */
  applyMatrix(matrix: DOMMatrix, offset: boolean): boolean {
    if (!this.transformElementCoordinates) {
      return super.applyMatrix(matrix, offset);
    }
    const element = this.node.getElement();
    // const transform = Utils.getElementTransform(element);
    // matrix = transform.matrix.multiply(matrix);

    const out = MatrixUtils.matrixRectTransform(this.startRect, matrix);
    if (!out) {
      return false;
    }

    this.saveInitialValue();
    this.onReverseScale(out);

    this.propertiesService.setNum(this.node, this.propX, out.x);
    this.propertiesService.setNum(this.node, this.propY, out.y);
    this.propertiesService.setNum(this.node, this.sizePropertyX, out.width);
    this.propertiesService.setNum(this.node, this.sizePropertyY, out.height);
    return true;
  }

  protected onReverseScale(rect: DOMRect): DOMRect {
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

  getX(): number {
    return this.propertiesService.getNum(this.node, this.propX);
  }

  getY(): number {
    return this.propertiesService.getNum(this.node, this.propY);
  }
  getSizeX(): number {
    return this.propertiesService.getNum(this.node, this.sizePropertyX);
  }

  getSizeY(): number {
    return this.propertiesService.getNum(this.node, this.sizePropertyY);
  }
}
