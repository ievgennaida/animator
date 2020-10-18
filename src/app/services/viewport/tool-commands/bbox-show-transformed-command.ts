import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/models/base-command";
import { consts } from "src/environments/consts";
import { AdornersRenderer } from "../renderers/adorners.renderer";
@Injectable({
  providedIn: "root",
})
export class BBoxShowTransformedCommand implements BaseCommand {
  constructor(private adornersRenderer: AdornersRenderer) {}
  icon = "crop_16_9-black-18dp-transformed";
  active = consts.showTransformedBBoxes;
  group = "transform_mode";
  tooltip = "Show only untransformed bboxes";
  execute() {
    consts.showTransformedBBoxes = true;
    this.active = consts.showTransformedBBoxes;
    this.adornersRenderer.invalidate();
  }
  deactivate() {
    this.active = false;
  }
}
