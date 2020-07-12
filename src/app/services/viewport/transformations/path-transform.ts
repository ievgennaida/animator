import { MatrixTransform } from "./matrix-transform";
import { Utils } from "../../utils/utils";
import { PathType } from "src/app/models/path/path-type";
import { PathData } from "src/app/models/path/path-data";
export class PathTransform extends MatrixTransform {
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
  rotate(angle: number, transformPoint: DOMPoint) {
    super.rotate(angle, transformPoint);
    return;
    // angle = angle < 0 ? -1 : 1;
    const element = this.getElement();

    const matrix = element.ownerSVGElement
      .createSVGMatrix()
      .translate(transformPoint.x, transformPoint.y)
      .rotate(angle, 0)
      .translate(-transformPoint.x, -transformPoint.y);

    const pathData = this.node.getPathData();
    let changed = false;
    angle = Utils.rad(angle);
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
