import { Injectable } from "@angular/core";
import { BaseTool } from "./base.tool";
import { MouseEventArgs } from "../../models/mouse-event-args";
import { ViewService } from "../view.service";
import { SvgShapes } from "../svg/svg-shapes";
import { DocumentService } from "../document.service";
import { Utils } from "../utils/utils";

@Injectable({
  providedIn: "root",
})
export class ShapeTool extends BaseTool {
  iconName = "crop_square";
  spawn: SvgShapes;
  constructor(
    private viewService: ViewService,
    private documentService: DocumentService,
  ) {
    super();
    this.spawn = new SvgShapes();
  }

  onViewportMouseDown(event: MouseEventArgs) {
    if (!this.viewService.isInit()) {
      return;
    }

    event.preventDefault();
    event.handled = true;

    const document = this.documentService.getDocument();
    if (!document || !document.rootNode) {
      return;
    }

    const addTo = document.rootNode;
    const pos = Utils.toElementPoint(addTo, event.screenPoint);

    const element = this.spawn.createRect();
    element.setAttribute("width", "100");
    element.setAttribute("height", "100");
    element.setAttribute("x", Utils.round(pos.x).toString());
    element.setAttribute("y", Utils.round(pos.y).toString());
    addTo.appendChild(element);
  }

  onDeactivate() {
    super.onDeactivate();
  }

  onActivate() {
    super.onActivate();
  }
}
