import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/services/commands/base-command";
import { AdornersService } from "../adorners-service";
import { ConfigService } from "../config-service";
import { AdornersRenderer } from "../viewport/renderers/adorners.renderer";

/**
 * Command that will allow viewport to manipulate visual elements in elements coordinates.
 */
@Injectable({
  providedIn: "root",
})
export class BBoxModeCommand implements BaseCommand {
  constructor(
    private adornersRenderer: AdornersRenderer,
    private adornersService: AdornersService,
    private configService: ConfigService
  ) {
    this.resolveState();
  }
  active = false;
  tooltip?: string;
  title?: string;
  icon: string;
  align = "right";
  execute() {
    const config = this.configService.get();
    config.showTransformedBBoxes = !config.showTransformedBBoxes;
    this.configService.save();
    this.resolveState();
    this.adornersService.cleanCache();
    this.adornersRenderer.invalidate();
  }
  resolveState() {
    const config = this.configService.get();
    if (config.showTransformedBBoxes) {
      this.icon = "crop_16_9-black-18dp-transformed";
      this.tooltip = "Display and manipulate transformed element bboxes";
    } else {
      this.icon = "crop_16_9-black-18dp";
      this.tooltip = "Show only untransformed bboxes";
    }
  }
  deactivate() {
    this.active = false;
  }
}
