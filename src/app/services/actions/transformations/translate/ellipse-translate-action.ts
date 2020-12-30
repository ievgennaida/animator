import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { RectTranslateAction } from "./rect-translate-action";
@Injectable({
  providedIn: "root",
})
export class EllipseTransformAction extends RectTranslateAction {
  // override
  propX = "cx";
  // override
  propY = "cy";
  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData) {
    super.init(node, screenPos, handle);
    const bbox = this.node.getBBox();
    this.start.x -= bbox.width / 2;
    this.start.y -= bbox.height / 2;
  }
}
