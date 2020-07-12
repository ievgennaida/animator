import { MatrixTransform, TransformationMode } from "./matrix-transform";
import { Utils } from "../../utils/utils";
import { PathType } from "src/app/models/path/path-type";
import { PathData } from "src/app/models/path/path-data";
export class PathTransform extends MatrixTransform {
  prevAngle = 0;
  transformOrigin: DOMPoint = null;
  beginMouseTransaction(mousePos: DOMPoint) {
    super.beginMouseTransaction(mousePos);
  }
  moveByMouse(screenPos: DOMPoint) {
    const element = this.getElement();
    const elementPoint = Utils.toElementPoint(element, screenPos);
    if (!elementPoint) {
      return;
    }

    this.translate(elementPoint);
    this.start = elementPoint;
  }
  beginMouseRotateTransaction(pos: DOMPoint) {
    const element = this.getElement();
    this.mode = TransformationMode.Rotate;
    this.transformOrigin = this.getTransformOrigin();
    const transformOrigin = this.transformOrigin;
    const transformedCenter = Utils.toScreenPoint(element, transformOrigin);
    this.startOffset = -Utils.angle(transformedCenter, pos);

    const matrix = this.transformToElement(
      element,
      element.parentNode as SVGGraphicsElement
    );

    const decomposed = this.decomposeMatrix(matrix);
    this.startOffset -= decomposed.rotateZ;
  }

  rotateByMouse(currentViewPoint: DOMPoint) {
    const transformPoint = this.transformOrigin;
    const element = this.getElement();
    const screenTransformOrigin = Utils.toScreenPoint(element, transformPoint);
    let angle = -Utils.angle(screenTransformOrigin, currentViewPoint);

    angle -= this.startOffset;
    const angleBefore = angle;
    angle -= this.prevAngle;
    this.rotateOffset(angle, transformPoint);
    this.prevAngle = angleBefore;
  }

  rotateOffset(angle: number, transformPoint: DOMPoint) {
    const element = this.getElement();

    const matrix = element.ownerSVGElement
      .createSVGMatrix()
      .translate(transformPoint.x, transformPoint.y)
      .rotate(angle, 0, 0)
      .translate(-transformPoint.x, -transformPoint.y);

    const pathData = this.node.getPathData();
    let changed = false;
    if (pathData && pathData.commands) {
      pathData.commands.forEach((command) => {
        if (command && command.isAbsolute()) {
          if (
            command.type === PathType.horizontal ||
            command.type === PathType.vertical
          ) {
            PathData.convertCommand(command, PathType.line);
          } else if (
            command.type === PathType.horizontalAbs ||
            command.type === PathType.verticalAbs
          ) {
            PathData.convertCommand(command, PathType.lineAbs);
          }
          const p = command.p;
          // Command point:
          if (p) {
            changed = true;
            command.p = p.matrixTransform(matrix);
          }
          // Command handles:
          const a = command.a;
          if (a) {
            command.a = a.matrixTransform(matrix);
            changed = true;
          }
          const b = command.b;
          if (b) {
            command.b = b.matrixTransform(matrix);
            changed = true;
          }
        }
      });
    }
    if (changed) {
      this.node.setPathData(pathData);
      this.transformsService.emitTransformed(this.getElement());
    }
  }
  translate(elementPoint: DOMPoint) {
    const offsetX = elementPoint.x - this.start.x;
    const offsetY = elementPoint.y - this.start.y;
    // console.log(Utils.roundTwo(offsetX) + "x" + Utils.roundTwo(offsetY));
    const pathData = this.node.getPathData();
    let changed = false;
    if (pathData && pathData.commands) {
      pathData.commands.forEach((command, index) => {
        if (command && (command.isAbsolute() || index === 0)) {
          if (offsetX || offsetY) {
            changed = true;
            command.offset(offsetX, offsetY);
            command.offsetHandles(offsetX, offsetY);
          }
        }
      });
    }
    if (changed) {
      this.node.setPathData(pathData);
      this.transformsService.emitTransformed(this.getElement());
    }
  }
}
