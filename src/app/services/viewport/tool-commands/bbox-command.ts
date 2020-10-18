import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/models/base-command";
import { consts } from "src/environments/consts";
import { AdornersRenderer } from '../renderers/adorners.renderer';
/**
 * Command that will allow viewport to manipulate visual elements in elements coordinates.
 */
@Injectable({
  providedIn: "root",
})
export class BBoxCommand implements BaseCommand {
  constructor(private adornersRenderer: AdornersRenderer) {}
  icon = "crop_16_9-black-18dp";
  active = !consts.showTransformedBBoxes;
  group = "transform_mode";
  tooltip = "Display and manipulate transformed element bboxes";
  execute() {
    consts.showTransformedBBoxes = false;
    this.active = !consts.showTransformedBBoxes;
    this.adornersRenderer.invalidate();
  }
  deactivate() {
    this.active = false;
  }
}
