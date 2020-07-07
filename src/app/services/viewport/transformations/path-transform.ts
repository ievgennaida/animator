import { MatrixTransform } from "./matrix-transform";
import { Utils } from "../../utils/utils";

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
  translate(elementPoint: DOMPoint) {
    const offsetX = elementPoint.x - this.start.x;
    const offsetY = elementPoint.y - this.start.y;
    console.log(Utils.roundTwo(offsetX) + "x" + Utils.roundTwo(offsetY));
    const pathData = this.node.getPathData();
    let changed = false;
    if (pathData && pathData.commands) {
      pathData.commands.forEach((command) => {
        if (command && command.isAbsolute()) {
          if (offsetX && offsetY) {
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
