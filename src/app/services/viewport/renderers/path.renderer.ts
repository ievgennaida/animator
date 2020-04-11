import { Injectable } from "@angular/core";
import { LoggerService } from "../../logger.service";
import { ViewService } from "../../view.service";
import { BaseRenderer } from "./base.renderer";
import { SelectionService } from "../../selection.service";
import { MouseEventArgs } from "../mouse-event-args";

@Injectable({
  providedIn: "root",
})
export class PathRenderer extends BaseRenderer {
  constructor(
    protected viewService: ViewService,
    protected logger: LoggerService,
    private selectionService: SelectionService
  ) {
    super();
    this.suspend();
  }

  onWindowMouseMove(event: MouseEventArgs) {}

  redraw() {
    if (!this.ctx) {
      return;
    }

    this.clear();
    this.invalidated = false;
    const nodes = this.selectionService.getSelectedNodes();
    nodes.forEach((node) => {
      const data = node.getPathData();
      if (data && data.commands) {
        data.commands.forEach((command) => {
          const abs = command.getAbsolute();

          const values = abs.values;

          if (values && values.length >= 2) {
            let position = new DOMPoint(values[0], values[1]);
            const ctm = this.screenCTM.multiply(node.getScreenCTM());
            position = position.matrixTransform(ctm);
            this.drawCross(this.ctx, position);
          }
        });
      }
    });
  }
}
