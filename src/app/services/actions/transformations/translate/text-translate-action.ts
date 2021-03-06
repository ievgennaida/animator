import { Injectable } from "@angular/core";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { SVGElementType } from "src/app/services/svg/svg-element-type";
import { RectTranslateAction } from "./rect-translate-action";

@Injectable({
  providedIn: "root",
})
export class TextTranslateAction extends RectTranslateAction {
  init(node: TreeNode, screenPos: DOMPoint, handle: HandleData): void {
    super.init(node, screenPos, handle);
    if (!this.node) {
      return;
    }
    const bbox = this.node.getBBox();
    if (!bbox || !this.start) {
      return;
    }
    if (this.node.type === SVGElementType.tspan) {
      this.start.y -= bbox.height;
    }
  }
}
